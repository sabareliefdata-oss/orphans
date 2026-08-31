import urllib.request
import json

def run_tests():
    # 1. Health check
    res = urllib.request.urlopen('http://localhost:5000/api/health')
    print('1. Health Check:', res.read().decode())

    # 2. Test Reviewer Password Login (Auto-role)
    req = urllib.request.Request(
        'http://localhost:5000/api/auth/login',
        data=json.dumps({'password': 'ON@Review#7315*Scripts'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    reviewer_token = data['token']
    print('2. Reviewer Auto-Role Login:', data['user']['name'], f"(Role: {data['user']['role']})")

    # 3. Test Admin Password Login (Auto-role)
    req = urllib.request.Request(
        'http://localhost:5000/api/auth/login',
        data=json.dumps({'password': 'ON@Admin#9482$Yemen'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    admin_data = json.loads(res.read().decode())
    print('3. Admin Auto-Role Login:', admin_data['user']['name'], f"(Role: {admin_data['user']['role']})")

    # 4. Fetch scripts
    req = urllib.request.Request('http://localhost:5000/api/scripts', headers={'Authorization': f'Bearer {reviewer_token}'})
    res = urllib.request.urlopen(req)
    scripts = json.loads(res.read().decode())['scripts']
    print(f'4. Fetched total {len(scripts)} scripts!')

    # 5. Verify YE-02882 (#21) and YE-02303 (#22)
    s21 = [s for s in scripts if '02882' in s['orphan_code']][0]
    s22 = [s for s in scripts if '02303' in s['orphan_code']][0]
    print('5. Verification of #21 [', s21['orphan_code'], '-', s21['child_name'], ']:')
    print('   Length:', len(s21['script_text']), 'chars')
    print('   Text:', s21['script_text'])
    print()
    print('   Verification of #22 [', s22['orphan_code'], '-', s22['child_name'], ']:')
    print('   Length:', len(s22['script_text']), 'chars')
    print('   Text:', s22['script_text'])

if __name__ == '__main__':
    run_tests()
