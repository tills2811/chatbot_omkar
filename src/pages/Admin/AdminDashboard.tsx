import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, BookOpen, Mail, Calendar, UserCheck, LayoutDashboard, FileText, Upload, X } from 'lucide-react';

import { useAppContext } from '../../context/AppContext';
import './Admin.css';

const AdminDashboard = () => {
    const { knowledgeBase, addKnowledge, removeKnowledge, savedEmails } = useAppContext();
    const [activeTab, setActiveTab] = useState<'knowledge' | 'emails'>('knowledge');
    const [newEntry, setNewEntry] = useState({ title: '', category: 'General', content: '' });
    const [fileData, setFileData] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    console.log('Current AdminDashboard Emails:', savedEmails);




    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFileData(base64String);
            setFileName(file.name);
            if (file.type.startsWith('image/')) {
                setFileType('image');
            } else if (file.type === 'application/pdf') {
                setFileType('pdf');
            } else {
                setFileType('doc');
            }
        };
        reader.readAsDataURL(file);
    };

    const clearFile = () => {
        setFileData(null);
        setFileType(null);
        setFileName(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.title || !newEntry.content) return;

        const entryToSave = {
            ...newEntry,
            ...(fileData ? { fileData, fileType: fileType as any } : {})
        };

        addKnowledge(entryToSave);
        setNewEntry({ title: '', category: 'General', content: '' });
        clearFile();
    };


    return (
        <div className="admin-page">
            <header className="page-header">
                <h1><LayoutDashboard size={28} /> Admin Dashboard</h1>
                <p>Manage your chatbot's knowledge and view recruiter leads in one place.</p>
            </header>

            <div className="admin-tabs glass">
                <button
                    className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
                    onClick={() => setActiveTab('knowledge')}
                >
                    <BookOpen size={18} /> Knowledge Base
                </button>
                <button
                    className={`tab-btn ${activeTab === 'emails' ? 'active' : ''}`}
                    onClick={() => setActiveTab('emails')}
                >
                    <Mail size={18} /> Email Logs
                    {savedEmails.length > 0 && <span className="tab-badge">{savedEmails.length}</span>}
                </button>

            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'knowledge' ? (
                    <motion.div
                        key="knowledge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="admin-grid"
                    >
                        <section className="add-entry glass">
                            <h2><Plus size={20} /> Add New Entry</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Project X, Skills, Experience"
                                        value={newEntry.title}
                                        onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select
                                        value={newEntry.category}
                                        onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                    >
                                        <option value="General">General</option>
                                        <option value="Experience">Experience</option>
                                        <option value="Projects">Projects</option>
                                        <option value="Skills">Skills</option>
                                        <option value="Education">Education</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Content / Description</label>
                                    <textarea
                                        placeholder="Describe this topic in detail..."
                                        rows={5}
                                        value={newEntry.content}
                                        onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Attachments (Photos, PDF, Docs)</label>
                                    <div className="file-upload-container">
                                        {!fileData ? (
                                            <label className="file-upload-label glass">
                                                <Upload size={20} />
                                                <span>Choose File</span>
                                                <input type="file" onChange={handleFileChange} hidden accept="image/*,.pdf,.doc,.docx" />
                                            </label>
                                        ) : (
                                            <div className="file-preview-strip glass">
                                                {fileType === 'image' ? (
                                                    <img src={fileData} alt="Preview" className="thumb-preview" />
                                                ) : (
                                                    <div className="doc-icon-preview">
                                                        <FileText size={20} />
                                                        <span className="file-name-text">{fileName}</span>
                                                    </div>
                                                )}
                                                <button type="button" onClick={clearFile} className="clear-file-btn">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary">Add to KB</button>
                            </form>
                        </section>

                        <section className="entries-list">
                            <h2><BookOpen size={20} /> Current Knowledge</h2>
                            <div className="scroll-area">
                                {knowledgeBase.map((entry) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="entry-card glass"
                                    >
                                        <div className="entry-header">
                                            <div>
                                                <h3>{entry.title}</h3>
                                                <span className="category-badge"><Tag size={12} /> {entry.category}</span>
                                            </div>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => removeKnowledge(entry.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="entry-content">{entry.content}</p>

                                        {entry.fileData && (
                                            <div className="entry-attachment">
                                                {entry.fileType === 'image' ? (
                                                    <img src={entry.fileData} alt={entry.title} className="attached-image" />
                                                ) : (
                                                    <div className="attached-doc">
                                                        <FileText size={18} />
                                                        <span>Attached {entry.fileType?.toUpperCase()} Document</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                ))}
                                {knowledgeBase.length === 0 && (
                                    <p className="empty-state">No knowledge entries yet. Add one to get started!</p>
                                )}
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div
                        key="emails"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="email-stats glass">
                            <div className="stat-card">
                                <UserCheck size={24} color="var(--primary)" />
                                <div>
                                    <span className="label">Total Leads</span>
                                    <span className="value">{savedEmails.length}</span>
                                </div>
                            </div>
                        </div>

                        <section className="emails-list">
                            <div className="table-header glass">
                                <span className="col">Email Address</span>
                                <span className="col">Date Captured</span>
                            </div>
                            <div className="scroll-area">
                                {savedEmails.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="email-row glass"
                                    >
                                        <span className="col email">
                                            <Mail size={16} /> {entry.email}
                                        </span>
                                        <span className="col date">
                                            <Calendar size={16} /> {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </motion.div>
                                ))}
                                {savedEmails.length === 0 && (
                                    <div className="empty-state">
                                        <p>No emails collected yet. Share your chatbot link to start gathering leads!</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
