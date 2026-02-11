import { Issue, IssueStatus, IssuePriority, Role, StaffMember } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { StatusBadge, PriorityBadge, TimeAgoBadge } from './StatusBadge';
import { MapPin, User, Building2, Calendar, Clock, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ISSUE_CATEGORIES } from '@/constants';
import { useIssues } from '@/contexts/IssuesContext';
import { toDate } from '@/utils/issueDetailsUtils';

interface IssueDetailsDialogProps {
    issue: Issue | null;
    open: boolean;
    role: Role
    onOpenChange: (open: boolean) => void;
    staffMembers: StaffMember[]
}

export function IssueDetailsDialog({ issue, open, role, onOpenChange, staffMembers }: IssueDetailsDialogProps) {
    const { updateIssueStatus, updateIssuePriority, assignIssue } = useIssues();
    const category = ISSUE_CATEGORIES.find(c => c.value === issue?.category);


    if (!issue) return null;

    const date = toDate(issue.createdAt)

    const canManage = role === 'admin';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-2xl shrink-0">
                            {category?.icon || '📝'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-display">
                                {issue.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {category?.label || issue.category} • ID: {issue.id}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Status and Priority Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge status={issue.status} />
                        <PriorityBadge priority={issue.priority} />
                        <TimeAgoBadge date={issue.createdAt} />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                        <p className="text-foreground bg-muted/50 rounded-lg p-4">
                            {issue.description}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {issue.roomNumber && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Room</p>
                                    <p className="font-medium">{issue.roomNumber}</p>
                                </div>
                            </div>
                        )}

                        {issue.propertyName && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Property</p>
                                    <p className="font-medium">{issue.propertyName}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Reported By</p>
                                <p className="font-medium">{issue.isAnonymous ? 'Anonymous' : issue.guestName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="font-medium">{format(date!, 'MMM d, yyyy h:mm a')}</p>
                            </div>
                        </div>

                        {issue.assignedToName && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <UserCircle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Assigned To</p>
                                    <p className="font-medium">{issue.assignedToName}</p>
                                </div>
                            </div>
                        )}

                        {issue.resolvedAt && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Resolved</p>
                                    <p className="font-medium">{format(issue.resolvedAt, 'MMM d, yyyy h:mm a')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Management Controls (Staff/Admin only) */}
                    {canManage && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <h4 className="text-sm font-medium text-muted-foreground">Manage Issue</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Status Control */}
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Status</label>
                                    <Select
                                        value={issue.status}
                                        onValueChange={(value) => updateIssueStatus(issue.id, value as IssueStatus)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Priority Control */}
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Priority</label>
                                    <Select
                                        value={issue.priority}
                                        onValueChange={(value) => updateIssuePriority(issue.id, value as IssuePriority)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assignment Control */}
                                <div className="space-y-2">
                                    <label className="text-xs text-muted-foreground">Assign To</label>
                                    <Select
                                        value={issue.assignedTo || ''}
                                        onValueChange={(value) => {
                                            const staff = staffMembers.find(s => s.id === value);
                                            if (staff && staff.email) {
                                                assignIssue(issue.id, staff.id, staff.email);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {staffMembers.map(staff => (
                                                <SelectItem key={staff.id} value={staff.id}>
                                                    {staff.name || staff.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {issue.status === 'open' && (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            updateIssueStatus(issue.id, 'in_progress')
                                            onOpenChange(false)
                                        }}
                                    >
                                        Start Working
                                    </Button>
                                )}
                                {issue.status === 'in_progress' && (
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                            updateIssueStatus(issue.id, 'resolved')
                                            onOpenChange(false)
                                        }}
                                    >
                                        Mark Resolved
                                    </Button>
                                )}
                                {issue.status === 'resolved' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            updateIssueStatus(issue.id, 'open')
                                            onOpenChange(false)
                                        }}
                                    >
                                        Reopen Issue
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
