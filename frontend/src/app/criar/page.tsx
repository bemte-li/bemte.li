'use client'

import Editor from '@/components/editor';
import React, { useState } from 'react';

export default function Page() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [title, setTitle] = useState('');

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFrom(e.target.value);
    };

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTo(e.target.value);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    return (
        <div>
            <label htmlFor="from">From:</label>
            <input type="text" id="from" value={from} onChange={handleFromChange} />

            <label htmlFor="to">To:</label>
            <input type="text" id="to" value={to} onChange={handleToChange} />

            <label htmlFor="title">Title:</label>
            <input type="text" id="title" value={title} onChange={handleTitleChange} />

            <Editor />
        </div>
    );
}