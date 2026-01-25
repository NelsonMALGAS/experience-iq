"use client"

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, X } from 'lucide-react';
import { IssueStatus, IssuePriority, IssueCategory } from '@/types';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/constants';

export interface FilterState {
    search: string;
    status: IssueStatus | 'all';
    priority: IssuePriority | 'all';
    category: IssueCategory | 'all';
}

interface IssueFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    showCategoryFilter?: boolean;
}

export function IssueFilters({ filters, onFiltersChange, showCategoryFilter = true }: IssueFiltersProps) {
    const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all';

    const clearFilters = () => {
        onFiltersChange({
            ...filters,
            status: 'all',
            priority: 'all',
            category: 'all',
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search issues..."
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                    className="pl-9 bg-muted/50 border-border"
                />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
                {/* Status Filter */}
                <Select
                    value={filters.status}
                    onValueChange={(value) => onFiltersChange({ ...filters, status: value as IssueStatus | 'all' })}
                >
                    <SelectTrigger className="w-32.5 bg-muted/50">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {ISSUE_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select
                    value={filters.priority}
                    onValueChange={(value) => onFiltersChange({ ...filters, priority: value as IssuePriority | 'all' })}
                >
                    <SelectTrigger className="w-32.5 bg-muted/50">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        {ISSUE_PRIORITIES.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                {showCategoryFilter && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-muted/50">
                                <Filter className="h-4 w-4 mr-2" />
                                Category
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-50 p-2" align="end">
                            <div className="space-y-1">
                                <Button
                                    variant={filters.category === 'all' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => onFiltersChange({ ...filters, category: 'all' })}
                                >
                                    All Categories
                                </Button>
                                {ISSUE_CATEGORIES.map(cat => (
                                    <Button
                                        key={cat.value}
                                        variant={filters.category === cat.value ? 'secondary' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => onFiltersChange({ ...filters, category: cat.value as IssueCategory })}
                                    >
                                        <span className="mr-2">{cat.icon}</span>
                                        {cat.label}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
