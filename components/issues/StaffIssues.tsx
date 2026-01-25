"use client"

import { useState } from 'react';
import { IssueFilters } from '@/components/issues/IssueFilters';
import { IssueDetailsDialog } from '@/components/issues/IssueDetailsDialog';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppUser, Issue, Role } from '@/types';
import { useIssues } from '@/contexts/IssuesContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { IssueCard } from './IssueCard';


type StaffIssuesProps = {
    role: Role,
    uid: AppUser["uid"]
}

export default function StaffIssues({ role, uid }: StaffIssuesProps) {
    const { issues } = useIssues();
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter for property issues
    const propertyIssues = issues.filter(i => i.propertyId === 'prop-1');
    const assignedIssues = propertyIssues.filter(i => i.assignedTo === '2');

    console.log("Assigned Issues", assignedIssues)

    const { filters, setFilters, filteredIssues } = useIssueFilters(propertyIssues);

    const openIssues = filteredIssues.filter(i => i.status === 'open');
    const inProgressIssues = filteredIssues.filter(i => i.status === 'in_progress');
    const filteredAssigned = filteredIssues.filter(i => i.assignedTo === '2');

    const handleIssueClick = (issue: Issue) => {
        setSelectedIssue(issue);
        setDialogOpen(true);
    };

    return (
        <DashboardLayout role={role} uid={uid}>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Assigned Issues</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage and resolve guest-reported issues
                        </p>
                    </div>

                    <IssueFilters filters={filters} onFiltersChange={setFilters} />
                </div>

                <Tabs defaultValue="assigned" className="w-full">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="assigned" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            My Assigned ({filteredAssigned.length})
                        </TabsTrigger>
                        <TabsTrigger value="open" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            Open ({openIssues.length})
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            In Progress ({inProgressIssues.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assigned" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAssigned.map((issue, index) => (
                                <div
                                    key={issue.id}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <IssueCard issue={issue} onClick={() => handleIssueClick(issue)} />
                                </div>
                            ))}
                            {filteredAssigned.length === 0 && (
                                <p className="text-muted-foreground col-span-full text-center py-8">
                                    No assigned issues found
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="open" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {openIssues.map((issue) => (
                                <IssueCard key={issue.id} issue={issue} onClick={() => handleIssueClick(issue)} />
                            ))}
                            {openIssues.length === 0 && (
                                <p className="text-muted-foreground col-span-full text-center py-8">
                                    No open issues found
                                </p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="progress" className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {inProgressIssues.map((issue) => (
                                <IssueCard key={issue.id} issue={issue} onClick={() => handleIssueClick(issue)} />
                            ))}
                            {inProgressIssues.length === 0 && (
                                <p className="text-muted-foreground col-span-full text-center py-8">
                                    No in-progress issues found
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <IssueDetailsDialog
                issue={selectedIssue}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                role={role}
            />
        </DashboardLayout>
    );
}
