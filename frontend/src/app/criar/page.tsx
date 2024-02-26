'use client'

import Editor from '@/components/editor';
import Rodape from '@/components/rodape';
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

    const handleSendTest = () => {
        console.log('Send test');
    };

    const handlePreview = () => {
        console.log('Preview');
    };

    const handleSave = () => {
        console.log('Save');
    };

    const handleSend = () => {
        console.log('Send');
    };

    return (
        <div>
            <div>
                <button onClick={handleSendTest}>Send test</button>
                <button onClick={handlePreview}>Preview</button>
                <button onClick={handleSave}>Save</button>
                <button onClick={handleSend}>Send</button>
            </div>
            <div>
                <label htmlFor="from">From:</label>
                <input type="text" id="from" value={from} onChange={handleFromChange} />

                <label htmlFor="to">To:</label>
                <input type="text" id="to" value={to} onChange={handleToChange} />

                <label htmlFor="title">Title:</label>
                <input type="text" id="title" value={title} onChange={handleTitleChange} />
            </div>
            <Editor />
            <Rodape />
        </div>
    );
}