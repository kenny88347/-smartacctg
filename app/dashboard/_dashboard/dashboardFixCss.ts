export const DASHBOARD_FIX_CSS = `
  .smartacctg-dashboard-page {
    width: 100% !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    padding: clamp(12px, 3vw, 22px) !important;
  }

  .smartacctg-dashboard-page * {
    box-sizing: border-box !important;
  }

  .smartacctg-dashboard-page .sa-card {
    overflow: hidden !important;
    padding: clamp(14px, 3.4vw, 20px) !important;
  }

  .smartacctg-dashboard-page .dashboard-top-card.sa-card {
    overflow: visible !important;
    position: relative !important;
    z-index: 200 !important;
  }

  .smartacctg-dashboard-page .dashboard-avatar-wrap {
    position: relative !important;
    z-index: 300 !important;
  }

  .smartacctg-dashboard-page .dashboard-avatar-menu {
    overflow: visible !important;
    z-index: 99999 !important;
  }

  .smartacctg-dashboard-page h1 {
    font-size: clamp(26px, 7vw, 36px) !important;
    line-height: 1.12 !important;
    font-weight: 900 !important;
    letter-spacing: -0.03em !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .smartacctg-dashboard-page h2,
  .smartacctg-dashboard-page h3,
  .smartacctg-dashboard-page .sa-title-bold {
    font-size: clamp(20px, 5.2vw, 28px) !important;
    line-height: 1.15 !important;
    font-weight: 900 !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .smartacctg-dashboard-page p,
  .smartacctg-dashboard-page div,
  .smartacctg-dashboard-page span,
  .smartacctg-dashboard-page label,
  .smartacctg-dashboard-page input,
  .smartacctg-dashboard-page select,
  .smartacctg-dashboard-page textarea {
    font-weight: 400 !important;
    line-height: 1.32 !important;
  }

  .smartacctg-dashboard-page button,
  .smartacctg-dashboard-page strong {
    font-weight: 800 !important;
  }

  @keyframes saNoticeMarquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-120%); }
  }

  .smartacctg-dashboard-page .sa-dashboard-notice {
    color: #dc2626 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 8px !important;
  }

  .smartacctg-dashboard-page .sa-dashboard-notice-text {
    display: inline-block !important;
    padding-left: 100% !important;
    animation: saNoticeMarquee 15s linear infinite !important;
    color: #dc2626 !important;
    font-weight: 800 !important;
    font-size: clamp(15px, 4vw, 18px) !important;
    line-height: 1.25 !important;
    white-space: nowrap !important;
  }

  .smartacctg-dashboard-page .sa-fullscreen-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 9999 !important;
    width: 100vw !important;
    height: 100dvh !important;
    overflow: hidden !important;
    background: rgba(15, 23, 42, 0.58) !important;
    padding: 0 !important;
  }

  .smartacctg-dashboard-page .sa-fullscreen-modal {
    position: fixed !important;
    inset: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    min-height: 100dvh !important;
    max-height: 100dvh !important;
    margin: 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-top: none !important;
    border-bottom: none !important;
    padding: max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom)) !important;
  }

  .smartacctg-dashboard-page .sa-modal-top {
    position: sticky !important;
    top: 0 !important;
    z-index: 20 !important;
    background: inherit !important;
    padding-bottom: 10px !important;
    margin-bottom: 10px !important;
  }

  .smartacctg-dashboard-page .dashboard-top-card {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    gap: 10px !important;
    align-items: center !important;
  }

  .smartacctg-dashboard-page .dashboard-plan-text {
    font-size: clamp(15px, 3.8vw, 18px) !important;
    line-height: 1.25 !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  .smartacctg-dashboard-page .dashboard-summary-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .dashboard-stat-card {
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    padding: clamp(12px, 3vw, 16px) !important;
    border-radius: 22px !important;
  }

  .smartacctg-dashboard-page .dashboard-stat-card strong {
    font-size: clamp(17px, 4.3vw, 22px) !important;
    line-height: 1.15 !important;
  }

  .smartacctg-dashboard-page .dashboard-quick-grid,
  .smartacctg-dashboard-page .quick-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 8px !important;
    width: 100% !important;
    margin-top: 10px !important;
  }

  .smartacctg-dashboard-page .dashboard-quick-grid button,
  .smartacctg-dashboard-page .quick-grid button {
    min-height: 54px !important;
    height: auto !important;
    padding: 8px 10px !important;
    font-size: clamp(15px, 4vw, 17px) !important;
    line-height: 1.15 !important;
    white-space: normal !important;
    word-break: break-word !important;
    text-align: center !important;
  }

  .smartacctg-dashboard-page .dashboard-app-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 18px 10px !important;
    align-items: start !important;
    width: 100% !important;
  }

  .smartacctg-dashboard-page .dashboard-app-icon-wrap {
    width: 100% !important;
    display: grid !important;
    justify-items: center !important;
    gap: 8px !important;
    min-width: 0 !important;
  }

  .smartacctg-dashboard-page .dashboard-app-icon {
    width: 64px !important;
    height: 64px !important;
    min-width: 64px !important;
    min-height: 64px !important;
    max-width: 64px !important;
    max-height: 64px !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    overflow: visible !important;
    touch-action: manipulation !important;
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  .smartacctg-dashboard-page .dashboard-app-icon img {
    width: 64px !important;
    height: 64px !important;
    max-width: 64px !important;
    max-height: 64px !important;
    object-fit: contain !important;
    display: block !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .smartacctg-dashboard-page .dashboard-app-name {
    width: 100% !important;
    text-align: center !important;
    line-height: 1.2 !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    font-size: clamp(15px, 3.8vw, 17px) !important;
    font-weight: 800 !important;
  }

  @media (max-width: 680px) {
    .smartacctg-dashboard-page .dashboard-summary-grid {
      grid-template-columns: 1fr !important;
    }

    .smartacctg-dashboard-page .dashboard-quick-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 430px) {
    .smartacctg-dashboard-page {
      padding: 12px !important;
    }

    .smartacctg-dashboard-page .dashboard-top-card {
      grid-template-columns: minmax(0, 1fr) auto !important;
      gap: 8px !important;
    }

    .smartacctg-dashboard-page h1 {
      font-size: clamp(24px, 7vw, 32px) !important;
    }

    .smartacctg-dashboard-page .dashboard-plan-text {
      font-size: 15px !important;
    }

    .smartacctg-dashboard-page .dashboard-app-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 18px 8px !important;
    }

    .smartacctg-dashboard-page .dashboard-app-icon,
    .smartacctg-dashboard-page .dashboard-app-icon img {
      width: 60px !important;
      height: 60px !important;
      min-width: 60px !important;
      min-height: 60px !important;
      max-width: 60px !important;
      max-height: 60px !important;
    }

    .smartacctg-dashboard-page .dashboard-app-name {
      font-size: 14px !important;
    }
  }

  @media (max-width: 360px) {
    .smartacctg-dashboard-page .dashboard-app-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }
`;
