"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';
import { Issue, IssueStatus, IssuePriority } from '@/types';
import { mockIssues } from '@/constants/mockData';
import { toast } from 'sonner';


interface IssueContextType {
    issues: Issue[];
    setIssues: Dispatch<SetStateAction<Issue[]>>,
    updateIssueStatus: (issueId: string, status: IssueStatus) => void;
    updateIssuePriority: (issueId: string, priority: IssuePriority) => void;
    assignIssue: (issueId: string, staffId: string, staffEmail: string) => void;
    addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => void;
    getIssueById: (id: string) => Issue | undefined;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: ReactNode }) {
    const [issues, setIssues] = useState<Issue[]>(mockIssues);


    const updateIssueStatus = useCallback((issueId: string, status: IssueStatus) => {
        setIssues(prev => prev.map(issue => {
            if (issue.id === issueId) {
                const updated: Issue = {
                    ...issue,
                    status,
                    updatedAt: new Date(),
                    ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
                };
                return updated;
            }
            return issue;
        }));

        toast.success("🎊 Status Updated", {
            description: `Issue status changed to ${status.replace('_', ' ')}`
        });

    }, []);

    const updateIssuePriority = useCallback((issueId: string, priority: IssuePriority) => {
        setIssues(prev => prev.map(issue => {
            if (issue.id === issueId) {
                return {
                    ...issue,
                    priority,
                    updatedAt: new Date(),
                };
            }
            return issue;
        }));

        toast.success("🎊 Priority Updated", {
            description: `Issue priority changed to ${priority}`
        });


    }, []);

    const assignIssue = useCallback((issueId: string, staffId: string, staffEmail: string) => {
        setIssues(prev => prev.map(issue => {
            if (issue.id === issueId) {
                return {
                    ...issue,
                    assignedTo: staffId,
                    assignedToName: staffEmail,
                    status: 'in_progress' as IssueStatus,
                    updatedAt: new Date(),
                };
            }
            return issue;
        }));
        toast.success("🎊 Issue Assigned", {
            description: `Issue assigned to ${staffEmail}`
        });

    }, []);

    const addIssue = useCallback((issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newIssue: Issue = {
            ...issueData,
            id: `issue-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setIssues(prev => [newIssue, ...prev]);



        toast("Issue Reported", {

            description: "Your issue has been submitted successfully",
        });
    }, []);

    const getIssueById = useCallback((id: string) => {
        return issues.find(issue => issue.id === id);
    }, [issues]);

    return (
        <IssueContext.Provider value={{
            issues,
            setIssues,
            updateIssueStatus,
            updateIssuePriority,
            assignIssue,
            addIssue,
            getIssueById,
        }}>
            {children}
        </IssueContext.Provider>
    );
}

export function useIssues() {
    const context = useContext(IssueContext);
    if (context === undefined) {
        throw new Error('useIssues must be used within an IssueProvider');
    }
    return context;
}
