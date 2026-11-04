import React from 'react';
import PaginationControls from './PaginationControls';

export default function Pagination({ links = [] }) {
    if (!links || links.length <= 1) return null;
    return <PaginationControls links={links} />;
}
