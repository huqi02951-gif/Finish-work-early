/**
 * Word (.docx) 导出工具
 * 基于已安装的 `docx` 库，生成可下载的 .docx 文件。
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} from 'docx';

interface DocxSection {
  heading?: string;
  content: string;
}

/**
 * 通用：从纯文本段落生成 Word Blob
 */
export async function buildSimpleDocx(
  title: string,
  sections: DocxSection[],
  metadata?: { author?: string; date?: string }
): Promise<Blob> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    })
  );

  // Metadata line
  if (metadata?.date || metadata?.author) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [
              metadata.author && `作者：${metadata.author}`,
              metadata.date && `日期：${metadata.date}`,
            ].filter(Boolean).join('  |  '),
            size: 20,
            color: '888888',
            italics: true,
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Divider
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      },
      spacing: { after: 300 },
    })
  );

  // Sections
  for (const section of sections) {
    if (section.heading) {
      children.push(
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        })
      );
    }

    // Split by newlines and create paragraphs
    const lines = section.content.split('\n');
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 24, // 12pt
              font: '微软雅黑',
            }),
          ],
          spacing: { after: 120 },
        })
      );
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `\n— 由「客户经理 Agent」工具生成 —`,
          size: 18,
          color: 'AAAAAA',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBlob(doc);
}

/**
 * 敏感沟通助手专用：把四版话术导出为一份 Word
 */
export async function buildSensitiveCommDocx(
  scenarioName: string,
  customerName: string,
  outputs: { direct: string; formal: string; soft: string; phone: string }
): Promise<Blob> {
  const today = new Date().toLocaleDateString('zh-CN');
  return buildSimpleDocx(
    `敏感沟通话术 — ${scenarioName}`,
    [
      { heading: '版本一：直接发送版', content: outputs.direct },
      { heading: '版本二：正式版', content: outputs.formal },
      { heading: '版本三：柔和版', content: outputs.soft },
      { heading: '版本四：电话提纲', content: outputs.phone },
    ],
    {
      author: customerName ? `对象：${customerName}` : undefined,
      date: today,
    }
  );
}
