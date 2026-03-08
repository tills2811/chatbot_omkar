import React, { createContext, useContext, useState, useEffect } from 'react';

interface KnowledgeEntry {
  id: string;
  category: string;
  content: string;
  title: string;
  fileData?: string; // Base64 string
  fileType?: string; // 'image' | 'pdf' | 'doc'
}


interface SavedEmail {
  id: string;
  email: string;
  timestamp: string;
}

interface AppContextType {
  knowledgeBase: KnowledgeEntry[];
  addKnowledge: (entry: Omit<KnowledgeEntry, 'id'>) => void;
  removeKnowledge: (id: string) => void;
  savedEmails: SavedEmail[];
  saveEmail: (email: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>(() => {
    const defaultData = [
      { id: '1', category: 'General', title: 'Profile Summary', content: 'Omkar Arali is a Process Excellence and Optimization Lead with extensive experience in Industrial Engineering, Six Sigma, and AI-enabled automation. He has a proven track record in logistics, operations, and global offshoring.' },
      { id: '2', category: 'Experience', title: 'ATOS Pune', content: 'Associate Manager - Optimization Lead (July 2025 - Present). Led a 7-member team for 5 offshoring projects. Achieved 10 FTE cost savings through demand-capacity modeling and AI automation using RPA and OpenText.' },
      { id: '3', category: 'Experience', title: 'Xpressbees Logistics', content: 'Associate Manager - Process Design and Excellence (July 2023 - July 2025). Reduced misroutes from 18.7% to 4.3% via geo-based shipment allocation. Achieved 20% last-mile optimization and ₹50 lakh monthly RVP dispute savings.' },
      { id: '4', category: 'Projects', title: 'Impact Delivered', content: 'Omni-channel logistics optimization, RPA automation for HR, AI-based mail workflows, and real-time visibility dashboards for operations.' },
      { id: '5', category: 'Skills', title: 'Core Competencies', content: 'Six Sigma Black Belt, Process Mapping (AS-IS/TO-BE), Manpower Modeling, Lean Manufacturing, and RPA.' },
      { id: '6', category: 'Tools', title: 'Technical Stack', content: 'N8N, Zapier, Copilot Studio, UI Path, Power BI, SQL, Python, Power Automate, and JIRA.' },
      { id: '7', category: 'Contact', title: 'Contact Details', content: 'You can reach Omkar at Omkararali25@gmail.com or via LinkedIn: https://linkedin.com/in/omkar-arali-5402a2150. Phone: +91 8888361525.' }

    ];

    try {
      const saved = localStorage.getItem('kb_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // FORCE RESET if stale data (references Shreyas) is found during migration to Omkar
        if (JSON.stringify(parsed).includes('Shreyas')) {
          localStorage.removeItem('kb_data'); // Clear it
          return defaultData;
        }
        return parsed;
      }
      return defaultData;
    } catch (e) {
      console.error('Failed to parse KB data from localStorage', e);
      return defaultData;
    }
  });

  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>(() => {
    try {
      const saved = localStorage.getItem('email_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse email data from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kb_data', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  useEffect(() => {
    localStorage.setItem('email_data', JSON.stringify(savedEmails));
  }, [savedEmails]);

  const addKnowledge = (entry: Omit<KnowledgeEntry, 'id'>) => {
    const newEntry = { ...entry, id: Math.random().toString(36).substr(2, 9) };
    setKnowledgeBase(prev => [...prev, newEntry]);
  };

  const removeKnowledge = (id: string) => {
    setKnowledgeBase(prev => prev.filter(e => e.id !== id));
  };

  const saveEmail = (email: string) => {
    console.log('Attempting to save email:', email);
    if (savedEmails.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      console.log('Email already exists in logs:', email);
      return;
    }
    const newEmail = { id: Math.random().toString(36).substr(2, 9), email, timestamp: new Date().toISOString() };
    setSavedEmails(prev => {
      const updated = [...prev, newEmail];
      console.log('Updated email list:', updated);
      return updated;
    });
  };


  return (
    <AppContext.Provider value={{ knowledgeBase, addKnowledge, removeKnowledge, savedEmails, saveEmail }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
