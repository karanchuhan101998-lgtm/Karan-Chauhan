import { jsPDF } from 'jspdf';
import { Conversation } from '../types';

/**
 * Exports a conversation history as a formatted, multi-page PDF document.
 * Includes professional typography, brand headers, role identifiers,
 * timestamps, citations, and automated pagination footers.
 */
export function exportChatToPdf(conversation: Conversation): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin + 10;

  const renderPageHeader = () => {
    // Subtle running top bar
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Aura AI • Gemini Intelligence Workspace', margin, margin - 15);
    doc.text(
      new Date().toLocaleDateString(),
      pageWidth - margin,
      margin - 15,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.75);
    doc.line(margin, margin - 8, pageWidth - margin, margin - 8);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 25) {
      doc.addPage();
      y = margin + 15;
      renderPageHeader();
    }
  };

  // --- Document Header ---
  renderPageHeader();

  // Brand Eyebrow
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text('CONVERSATION INSIGHTS & SUMMARY', margin, y);
  y += 18;

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(
    conversation.title || 'Chat Conversation',
    contentWidth
  );
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22 + 4;

  // Metadata Information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const dateFormatted = new Date(
    conversation.createdAt || Date.now()
  ).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const modelName = conversation.model || 'Gemini 3.5';
  const metaText = `Exported: ${dateFormatted}   •   Engine: ${modelName}   •   Total Messages: ${conversation.messages.length}`;
  doc.text(metaText, margin, y);
  y += 14;

  // Decorative Rule
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  if (conversation.messages.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('No messages in this conversation yet.', margin, y);
    y += 20;
  }

  // --- Messages Thread ---
  conversation.messages.forEach((msg, index) => {
    const isUser = msg.role === 'user';
    const roleLabel = isUser ? 'USER' : 'GEMINI AI';
    const timeStr = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    // Check space for role badge + intro
    checkPageBreak(45);

    // Pill badge for role header
    if (isUser) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225); // slate-300
    } else {
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.setDrawColor(199, 210, 254); // indigo-200
    }
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'FD');

    // Role text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (isUser) {
      doc.setTextColor(51, 65, 85); // slate-700
    } else {
      doc.setTextColor(67, 56, 202); // indigo-700
    }
    doc.text(
      `#${index + 1}  ${roleLabel}`,
      margin + 10,
      y + 13
    );

    // Timestamp
    if (timeStr) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(timeStr, pageWidth - margin - 10, y + 13, { align: 'right' });
    }

    y += 26;

    // Attachments indicator if present
    if (msg.attachments && msg.attachments.length > 0) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const attNames = msg.attachments.map((a) => a.name).join(', ');
      doc.text(`[Attached files: ${attNames}]`, margin + 10, y);
      y += 14;
    }

    // Clean content for PDF rendering
    const plainText = msg.content
      .replace(/```[a-z]*\n([\s\S]*?)```/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .trim();

    // Render message body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800

    const splitLines = doc.splitTextToSize(
      plainText || '(No text content)',
      contentWidth - 20
    );
    const lineHeight = 13.5;

    for (let i = 0; i < splitLines.length; i++) {
      checkPageBreak(lineHeight + 4);
      doc.text(splitLines[i], margin + 10, y);
      y += lineHeight;
    }

    // Render citations if present
    if (msg.citations && msg.citations.length > 0) {
      checkPageBreak(25);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text('Citations & Grounding Sources:', margin + 10, y);
      y += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235); // blue-600
      msg.citations.slice(0, 4).forEach((cite) => {
        checkPageBreak(12);
        const citeText = `• ${cite.title || cite.url} (${cite.url})`;
        const wrappedCite = doc.splitTextToSize(citeText, contentWidth - 24);
        wrappedCite.forEach((line: string) => {
          doc.text(line, margin + 14, y);
          y += 11;
        });
      });
    }

    // Spacing between messages
    y += 14;
  });

  // --- Footers & Pagination ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - margin + 8, pageWidth - margin, pageHeight - margin + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Generated with Aura AI • Confidential & Offline Ready`,
      margin,
      pageHeight - margin + 20
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin + 20,
      { align: 'right' }
    );
  }

  // Trigger file download
  const safeFilename = (conversation.title || 'chat_history')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase()
    .slice(0, 35);
  doc.save(`${safeFilename}_chat.pdf`);
}
