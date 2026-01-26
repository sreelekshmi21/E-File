import React from 'react'

export default function MobileHeader({ onMenuToggle }) {
    return (
        <div className="mobile-header">
            <button
                className="hamburger-btn"
                onClick={onMenuToggle}
                aria-label="Toggle navigation menu"
            >
                <i className="bi bi-list"></i>
            </button>
            <h1 className="app-title">E-File</h1>
            <div className="header-spacer"></div>
        </div>
    )
}
