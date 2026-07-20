'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TicketComment } from '@/types';
import { Send, Trash2, MessageSquare, Paperclip, X } from 'lucide-react';

interface CommentsSectionProps {
  comments: TicketComment[];
  onAddComment: (content: string, attachment?: TicketComment['attachment']) => void;
  onDeleteComment: (id: string) => void;
}

export function formatCommentTime(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  
  if (diffMs < 0) return 'Just now'; // Handle minor clock drift
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return 'Yesterday';
  
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommentsSection({ comments = [], onAddComment, onDeleteComment }: CommentsSectionProps) {
  const { currentUser, isAdmin } = useApp();
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<TicketComment['attachment'] | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new comments
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to 1MB to protect localStorage quota
    if (file.size > 1024 * 1024) {
      alert("Attachment too large. Maximum file size is 1MB to save storage space.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !attachment) return;
    onAddComment(text.trim(), attachment ?? undefined);
    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
  };

  return (
    <div className="comments-container">
      <div className="comments-title-row">
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageSquare size={14} style={{ color: 'var(--accent-indigo-light)' }} />
          Comments & Updates
        </h3>
        <span className="comments-count">{comments.length}</span>
      </div>

      <div className="comments-list" ref={listRef}>
        {comments.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: 12,
            textAlign: 'center',
            padding: '24px 8px',
            gap: 8
          }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <div>No updates logged yet. Add a comment to post an update.</div>
          </div>
        ) : (
          comments.map((cmt) => {
            const canDelete = isAdmin || currentUser?.id === cmt.authorId;
            return (
              <div key={cmt.id} className="comment-item">
                <div className="comment-avatar">
                  {getInitials(cmt.authorName)}
                </div>
                <div className="comment-body" style={{ flex: 1, minWidth: 0 }}>
                  <div className="comment-meta">
                    <span className="comment-author">{cmt.authorName}</span>
                    <span className={`comment-role-tag ${cmt.authorRole.toLowerCase()}`}>
                      {cmt.authorRole}
                    </span>
                    <span className="comment-time">{formatCommentTime(cmt.createdAt)}</span>
                  </div>
                  <div className="comment-text">{cmt.content}</div>
                  {cmt.attachment && (() => {
                    const cleanAuthor = (cmt.authorName || 'User').replace(/[^a-zA-Z0-9]/g, '_');
                    const cleanFile = cmt.attachment.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const dateStr = cmt.createdAt.split('T')[0];
                    const structuredName = `GTC_${cleanAuthor}_${dateStr}_${cleanFile}`;
                    const isImg = cmt.attachment.type.startsWith('image/');
                    const isVid = cmt.attachment.type.startsWith('video/');

                    return (
                      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {isImg ? (
                          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '100%', maxHeight: 200, width: 'fit-content' }}>
                            <img
                              src={cmt.attachment.data}
                              alt={cmt.attachment.name}
                              style={{ display: 'block', maxWidth: '100%', height: 'auto', maxHeight: 200, cursor: 'pointer' }}
                              onClick={() => {
                                const w = window.open();
                                w?.document.write(`<iframe src="${cmt.attachment?.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }}
                            />
                          </div>
                        ) : isVid ? (
                          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '100%', maxHeight: 220, width: 'fit-content' }}>
                            <video src={cmt.attachment.data} controls style={{ maxWidth: '100%', maxHeight: 200 }} />
                          </div>
                        ) : null}

                        <a
                          href={cmt.attachment.data}
                          download={structuredName}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 12,
                            color: 'var(--accent-indigo-light)',
                            textDecoration: 'none',
                            width: 'fit-content',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          title={`Download as ${structuredName}`}
                        >
                          <span style={{ fontSize: 16 }}>{isImg ? '🖼️' : isVid ? '🎬' : '📎'}</span>
                          <span style={{ textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {cmt.attachment.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                            ({(cmt.attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </a>
                      </div>
                    );
                  })()}
                </div>
                {canDelete && (
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="comment-delete-btn"
                      onClick={() => onDeleteComment(cmt.id)}
                      title="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="comment-input-box">
        {attachment && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 8,
            padding: '6px 10px',
            marginBottom: 8,
            fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 14 }}>{attachment.type.startsWith('image/') ? '🖼️' : '📎'}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-primary)' }}>
                {attachment.name}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>
                ({(attachment.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-rose)',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-textarea"
            placeholder="Write an update on this ticket..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ paddingRight: 70, minHeight: 60, fontSize: 13 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            display: 'flex',
            gap: 6,
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-icon btn-secondary"
              style={{
                padding: 6,
                borderRadius: 6,
                border: 'none',
                background: 'rgba(255,255,255,0.04)'
              }}
              title="Attach snapshot or proof"
            >
              <Paperclip size={12} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              type="submit"
              className="btn btn-icon btn-primary"
              style={{
                padding: 6,
                borderRadius: 6,
                boxShadow: 'none'
              }}
              disabled={!text.trim() && !attachment}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Press Enter to post, Shift+Enter for new line. Max attachment size is 1MB.
        </div>
      </form>
    </div>
  );
}
