import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { MdChevronLeft, MdChevronRight, MdZoomIn, MdZoomOut, MdDownload } from 'react-icons/md';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({ title, fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  const changeScale = (delta) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0));
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract original extension if possible
      let ext = '.pdf';
      try {
        const urlParts = fileUrl.split('?')[0].split('.');
        if (urlParts.length > 1) {
          ext = '.' + urlParts.pop().toLowerCase();
        }
      } catch (e) {}
      
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, opening in new tab instead', err);
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => changeScale(-0.2)} title="Zoom Out" style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><MdZoomOut size={16} /></button>
          <span style={{ fontSize: '0.9rem', width: '3rem', textAlign: 'center', color: '#64748b' }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => changeScale(0.2)} title="Zoom In" style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><MdZoomIn size={16} /></button>
          
          <button onClick={handleDownload} style={{ background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
            <MdDownload size={16} /> <span className="hide-on-mobile">Download</span>
          </button>
        </div>
      </div>
      
      {/* PDF Container */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#f8fafc', 
        borderRadius: '8px', 
        overflow: 'auto', 
        WebkitOverflowScrolling: 'touch',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        position: 'relative'
      }}>
        <Document 
          file={fileUrl} 
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{ padding: '2rem', color: '#94a3b8' }}>Loading PDF...</div>}
          error={<div style={{ padding: '2rem', color: '#ef4444' }}>Failed to load PDF. Please use the download button.</div>}
        >
          {numPages && (
            <div style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          )}
        </Document>

        {/* Pagination Controls Fixed at Bottom */}
        {numPages && (
          <div style={{
            position: 'sticky',
            bottom: '1rem',
            marginTop: '2rem', // Pushes it to the bottom
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 10
          }}>
            <button 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              style={{ opacity: pageNumber <= 1 ? 0.5 : 1, color: '#0f172a', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MdChevronLeft size={24} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#0f172a' }}>
              Page {pageNumber} of {numPages}
            </span>
            <button 
              onClick={() => changePage(1)} 
              disabled={pageNumber >= numPages}
              style={{ opacity: pageNumber >= numPages ? 0.5 : 1, color: '#0f172a', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
