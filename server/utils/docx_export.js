const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

async function generateScriptsDocx(scripts, title = 'One Nation - Reviewed Orphan Video Scripts') {
  const children = [];

  // Header Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Total Scripts: ${scripts.length} | Generated on: ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`,
          italics: true,
          color: '555555',
          size: 20
        })
      ],
      spacing: { after: 400 }
    })
  );

  // Each script item
  scripts.forEach((item, index) => {
    // Card Title / Header: #1 - YE-01086 | Amwaj Nabeel
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `#${item.serial_no || index + 1}  [ ${item.orphan_code} ]  -  ${item.child_name}`,
            bold: true,
            size: 24,
            color: '0E4359'
          })
        ],
        spacing: { before: 240, after: 100 }
      })
    );

    // Status & metadata
    const statusText = item.status === 'approved' ? '🟢 APPROVED' : '🟡 WAITING REVIEW';
    const reviewerInfo = item.reviewed_by ? ` (Reviewed by: ${item.reviewed_by})` : '';
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Status: ${statusText}${reviewerInfo}`,
            size: 18,
            color: item.status === 'approved' ? '1B8044' : 'A78F31',
            bold: true
          })
        ],
        spacing: { after: 100 }
      })
    );

    // Script Text
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: item.script_text,
            size: 22
          })
        ],
        spacing: { after: 280 }
      })
    );

    // Divider
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '_________________________________________________________________________________',
            color: 'CCCCCC'
          })
        ],
        spacing: { after: 200 }
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children
      }
    ]
  });

  return await Packer.toBuffer(doc);
}

module.exports = { generateScriptsDocx };
