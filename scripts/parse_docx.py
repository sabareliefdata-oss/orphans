import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os

def parse_docx(file_path):
    with zipfile.ZipFile(file_path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)

    paragraphs = []
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]
        if texts:
            t = ''.join(texts).strip()
            if t:
                paragraphs.append(t)

    # Regex matching:
    # 1-YE-01086
    # (1) YE-02303
    # (13) YE-02582 Part 1
    # (13) YE-02582 Part 2
    # YE-01365
    # YE-01841
    entry_re = re.compile(r'^(?:[\(\[\{]?\d+[\)\]\}\.\-\:\s]*)?(YE\s*[\-_]?\s*\d{3,6})(?:\s*Part\s*(\d+))?\s*(.*)', re.IGNORECASE)

    name_patterns = [
        re.compile(r'(?:I\s+am|My\s+name\s+is|This\s+is|name:\s*)\s+(?:the\s+mother\s+of\s+(?:the\s+young\s+girl\s+|the\s+child\s+)?)?([A-Z][a-zA-Z\s\']{2,35}?)(?:\.|\,|\band\b|\bI\b|\bwho\b|\bfrom\b|\bgoing\b|\bgo\b|\bgrade\b|\byears\b|\bold\b|\bstudy\b|\blikes\b|\bhas\b|\bwakes\b|\bdoes\b|\'s\s+mother)', re.IGNORECASE),
        re.compile(r'Assalam\s+Alaikum[,\.\s]+(?:I\s+am\s+)?([A-Z][a-zA-Z\s\']{2,35}?)(?:\.|\,|\band\b|\bI\b|\'s\s+mother)', re.IGNORECASE)
    ]

    records = []
    for p in paragraphs:
        m = entry_re.match(p)
        if m:
            code_raw = m.group(1).upper().replace(' ', '').replace('_', '-')
            if not code_raw.startswith('YE-'):
                code_raw = 'YE-' + code_raw.replace('YE', '')
            part = m.group(2)
            rest = m.group(3).strip()

            # If it is Part 2 of the previous code, merge with previous
            if part == '2' and records and records[-1]['orphan_code'] == code_raw:
                records[-1]['script_text'] += ' ' + rest
            else:
                records.append({
                    'orphan_code': code_raw,
                    'script_text': rest,
                    'status': 'waiting',
                    'notes': '',
                    'reviewed_by': None,
                    'reviewed_at': None
                })
        else:
            if records:
                if records[-1]['script_text']:
                    records[-1]['script_text'] += ' ' + p
                else:
                    records[-1]['script_text'] = p

    # Process names & serials
    for i, r in enumerate(records):
        r['serial_no'] = i + 1
        text = r['script_text']
        child_name = 'Orphan Child'
        for np in name_patterns:
            nm = np.search(text)
            if nm:
                raw_name = nm.group(1).strip()
                raw_name = re.sub(r'\s+(is|and|who|to|in|at|on|for|likes|has)$', '', raw_name, flags=re.IGNORECASE).strip()
                if len(raw_name) > 2:
                    child_name = raw_name
                    break
        r['child_name'] = child_name

    return records

if __name__ == "__main__":
    docx_file = "الكل.docx"
    records = parse_docx(docx_file)
    print(f"Total exactly parsed records: {len(records)}")

    os.makedirs("data", exist_ok=True)
    with open("data/initial_scripts.json", "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print("Saved cleanly to data/initial_scripts.json")

    # Remove database.json so it resets cleanly on next server boot
    db_file = os.path.join("data", "database.json")
    if os.path.exists(db_file):
        os.remove(db_file)
        print("Removed old data/database.json for fresh re-seed")

    for i in [0, 20, 21, 33, 40, 92]:
        if i < len(records):
            r = records[i]
            print(f"#{r['serial_no']} | {r['orphan_code']} | Child: {r['child_name']}")
            print(f"   Text ({len(r['script_text'])} chars): {r['script_text'][:80]}...\n")
