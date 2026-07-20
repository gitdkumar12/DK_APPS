'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { VaultAsset } from '@/types';
import { 
  FolderDown, Search, Download, Image as ImageIcon, 
  FileText, Film, Eye, X, Filter, Grid, List, HardDrive 
} from 'lucide-react';

export default function VaultPage() {
  const { refreshKey } = useApp();
  const [assets, setAssets] = useState<VaultAsset[]>([]);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<'ALL' | 'TASK' | 'VALUATION'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'VIDEO' | 'DOC'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [previewAsset, setPreviewAsset] = useState<VaultAsset | null>(null);

  useEffect(() => {
    setAssets(LocalDbService.getVaultAssets());
  }, [refreshKey]);

  const filtered = assets.filter(a => {
    if (filterSource !== 'ALL' && a.sourceType !== filterSource) return false;
    if (filterType === 'IMAGE' && !a.fileType.startsWith('image/')) return false;
    if (filterType === 'VIDEO' && !a.fileType.startsWith('video/')) return false;
    if (filterType === 'DOC' && (a.fileType.startsWith('image/') || a.fileType.startsWith('video/'))) return false;

    if (search) {
      const s = search.toLowerCase();
      return (
        a.fileName.toLowerCase().includes(s) ||
        a.formattedFileName.toLowerCase().includes(s) ||
        a.sourceTitle.toLowerCase().includes(s) ||
        a.authorName.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalSizeKb = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0) / 1024;
  const imageCount = assets.filter(a => a.fileType.startsWith('image/')).length;
  const videoCount = assets.filter(a => a.fileType.startsWith('video/')).length;
  const docCount = assets.length - imageCount - videoCount;

  const downloadFile = (asset: VaultAsset) => {
    const a = document.createElement('a');
    a.href = asset.dataUrl;
    a.download = asset.formattedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset & File Vault</h1>
          <p className="page-subtitle">
            Central repository of all photos, screenshots, videos, and documents uploaded across the firm.
          </p>
        </div>
      </div>

      <div className="content-area" style={{ paddingTop: 0 }}>
        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-indigo-light)' }}>
              <FolderDown size={22} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{assets.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Vault Assets</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <HardDrive size={22} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                {totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb.toFixed(0)} KB`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Storage Consumed</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
              <ImageIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{imageCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Photos & Screenshots</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-violet)' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{docCount + videoCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Videos & Documents</div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Controls */}
        <div className="table-container">
          <div className="table-header">
            <div className="filter-bar">
              <input
                type="text"
                className="filter-input"
                placeholder="🔍 Search files, projects, authors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ minWidth: 240 }}
              />
              <select className="filter-input" value={filterSource} onChange={e => setFilterSource(e.target.value as any)}>
                <option value="ALL">All Modules</option>
                <option value="TASK">Architecture Tasks</option>
                <option value="VALUATION">Valuation Cases</option>
              </select>
              <select className="filter-input" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                <option value="ALL">All File Types</option>
                <option value="IMAGE">Photos & Screenshots</option>
                <option value="VIDEO">Videos</option>
                <option value="DOC">Documents & PDFs</option>
              </select>
              {(search || filterSource !== 'ALL' || filterType !== 'ALL') && (
                <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterSource('ALL'); setFilterType('ALL'); }}>
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="tabs" style={{ padding: 2 }}>
                <button className={`tab ${viewMode === 'GRID' ? 'active' : ''}`} onClick={() => setViewMode('GRID')} title="Grid View">
                  <Grid size={14} />
                </button>
                <button className={`tab ${viewMode === 'TABLE' ? 'active' : ''}`} onClick={() => setViewMode('TABLE')} title="Table View">
                  <List size={14} />
                </button>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filtered.length} of {assets.length} assets
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <FolderDown size={36} style={{ opacity: 0.4 }} />
              <span className="empty-title">No assets found in vault</span>
              <span className="empty-sub">Attachments uploaded in task or valuation comments will automatically appear here.</span>
            </div>
          ) : viewMode === 'GRID' ? (
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {filtered.map(asset => {
                const isImage = asset.fileType.startsWith('image/');
                const isVideo = asset.fileType.startsWith('video/');
                return (
                  <div key={asset.id} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                    {/* Media Preview Box */}
                    <div style={{
                      height: 140, borderRadius: 10, overflow: 'hidden',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {isImage ? (
                        <img src={asset.dataUrl} alt={asset.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : isVideo ? (
                        <video src={asset.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--accent-indigo-light)' }}>
                          <FileText size={38} />
                          <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600 }}>{asset.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                        </div>
                      )}

                      {/* Quick Action Overlay */}
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                        opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                      >
                        <button className="btn btn-secondary btn-sm" onClick={() => setPreviewAsset(asset)} title="Preview">
                          <Eye size={14} /> Preview
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => downloadFile(asset)} title="Download with Proper Name">
                          <Download size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.fileName}>
                        {asset.fileName}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--accent-indigo-light)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.sourceTitle}>
                        📌 {asset.sourceTitle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                        <span>by {asset.authorName.split(' ')[0]}</span>
                        <span>{formatSize(asset.fileSize)}</span>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => downloadFile(asset)}
                      style={{ width: '100%', justifyContent: 'center', fontSize: 11, padding: '6px 10px', marginTop: 2 }}
                    >
                      <Download size={12} /> Download Structured File
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Proper System Name</th>
                    <th>Source Module</th>
                    <th>Uploaded By</th>
                    <th>File Size</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => (
                    <tr key={asset.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {asset.fileType.startsWith('image/') ? <ImageIcon size={14} style={{ color: 'var(--accent-amber)' }} /> : <FileText size={14} style={{ color: 'var(--accent-indigo-light)' }} />}
                          <span>{asset.fileName}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-indigo-light)' }}>
                        {asset.formattedFileName}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <span className={`badge ${asset.sourceType === 'TASK' ? 'badge-open' : 'badge-dispatched'}`}>
                          {asset.sourceType}
                        </span>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{asset.sourceTitle}</div>
                      </td>
                      <td>{asset.authorName}</td>
                      <td>{formatSize(asset.fileSize)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(asset.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setPreviewAsset(asset)}>
                            <Eye size={12} /> View
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => downloadFile(asset)}>
                            <Download size={12} /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal modal-lg" style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title" style={{ fontSize: 16 }}>{previewAsset.fileName}</h2>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--accent-indigo-light)', marginTop: 2 }}>
                  {previewAsset.formattedFileName}
                </div>
              </div>
              <button className="btn btn-icon btn-secondary" onClick={() => setPreviewAsset(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ alignItems: 'center', justifyContent: 'center' }}>
              {previewAsset.fileType.startsWith('image/') ? (
                <img src={previewAsset.dataUrl} alt={previewAsset.fileName} style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 10, border: '1px solid var(--border)' }} />
              ) : previewAsset.fileType.startsWith('video/') ? (
                <video src={previewAsset.dataUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 10 }} />
              ) : (
                <iframe src={previewAsset.dataUrl} style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 10 }} />
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Uploaded by {previewAsset.authorName} ({previewAsset.authorRole}) · {formatSize(previewAsset.fileSize)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setPreviewAsset(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => downloadFile(previewAsset)}>
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
