/**
 * Application Filter Modal Component
 * 
 * Modal for selecting applications with category filtering
 * - Search functionality
 * - Horizontal scrollable category tabs
 * - Grouped application list by category
 * - Multi-select with checkboxes
 * 
 * @migration Phase 3: Form Components
 * @status ✅ CREATED
 * @version 1.0.0
 */

import { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import svgPaths from "../imports/svg-6ct6p1yg62";

export interface ApplicationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (applications: string[]) => void;
  initialSelected?: string[];
}

interface Application {
  id: string;
  name: string;
  category: string;
}

interface Category {
  id: string;
  label: string;
}

// Mock application data
const APPLICATIONS: Application[] = [
  // Online Video
  { id: 'youtube', name: 'Youtube', category: 'online-video' },
  { id: 'netflix', name: 'Netflix', category: 'online-video' },
  { id: 'vimeo', name: 'Vimeo', category: 'online-video' },
  { id: 'dailymotion', name: 'DailyMotion', category: 'online-video' },
  { id: 'tiktok', name: 'Tiktok', category: 'online-video' },
  { id: 'liveleak', name: 'Liveleak', category: 'online-video' },
  { id: 'twitch', name: 'Twitch', category: 'online-video' },
  
  // Remote Access
  { id: 'teamviewer', name: 'TeamViewer', category: 'remote-access' },
  { id: 'anydesk', name: 'AnyDesk', category: 'remote-access' },
  { id: 'rdp', name: 'Remote Desktop', category: 'remote-access' },
  { id: 'vnc', name: 'VNC', category: 'remote-access' },
  
  // Instant Messaging
  { id: 'whatsapp', name: 'WhatsApp', category: 'instant-messaging' },
  { id: 'telegram', name: 'Telegram', category: 'instant-messaging' },
  { id: 'signal', name: 'Signal', category: 'instant-messaging' },
  { id: 'discord', name: 'Discord', category: 'instant-messaging' },
  { id: 'slack', name: 'Slack', category: 'instant-messaging' },
  
  // Social Media
  { id: 'facebook', name: 'Facebook', category: 'social-media' },
  { id: 'twitter', name: 'Twitter', category: 'social-media' },
  { id: 'instagram', name: 'Instagram', category: 'social-media' },
  { id: 'linkedin', name: 'LinkedIn', category: 'social-media' },
  
  // File Sharing
  { id: 'dropbox', name: 'Dropbox', category: 'file-sharing' },
  { id: 'gdrive', name: 'Google Drive', category: 'file-sharing' },
  { id: 'onedrive', name: 'OneDrive', category: 'file-sharing' },
  
  // Gaming
  { id: 'steam', name: 'Steam', category: 'gaming' },
  { id: 'epic', name: 'Epic Games', category: 'gaming' },
  { id: 'origin', name: 'Origin', category: 'gaming' },
];

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All' },
  { id: 'online-video', label: 'Online Video' },
  { id: 'remote-access', label: 'Remote Access' },
  { id: 'instant-messaging', label: 'Instant Messaging' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'file-sharing', label: 'File Sharing' },
  { id: 'gaming', label: 'Gaming' },
];

export default function ApplicationFilterModal({
  isOpen,
  onClose,
  onApply,
  initialSelected = [],
}: ApplicationFilterModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApps, setSelectedApps] = useState<string[]>(initialSelected);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedApps(initialSelected);
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]); // Remove initialSelected from dependencies to prevent infinite loop

  if (!isOpen) return null;

  // Filter applications by search and category
  const filteredApps = APPLICATIONS.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedApps = filteredApps.reduce((acc, app) => {
    if (!acc[app.category]) {
      acc[app.category] = [];
    }
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  // Toggle application selection
  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  // Select all in current category
  const selectAllInCategory = (category: string) => {
    const categoryApps = APPLICATIONS.filter((app) => app.category === category);
    const allCategoryIds = categoryApps.map((app) => app.id);
    const allSelected = allCategoryIds.every((id) => selectedApps.includes(id));

    if (allSelected) {
      // Deselect all in category
      setSelectedApps((prev) => prev.filter((id) => !allCategoryIds.includes(id)));
    } else {
      // Select all in category
      const newSelected = [...selectedApps];
      allCategoryIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedApps(newSelected);
    }
  };

  // Handle apply
  const handleApply = () => {
    onApply(selectedApps);
    onClose();
  };

  // Scroll tabs
  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get category label
  const getCategoryLabel = (categoryId: string) => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    return category?.label || categoryId;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 transition-all duration-200"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with Search */}
        <div
          style={{
            padding: 'var(--spacing-lg)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-md)',
          }}
        >
          {/* Title + Close */}
          <div className="flex items-center justify-between">
            <h3
              className="font-['Roboto']"
              style={{
                fontSize: 'var(--text-h4)',
                fontWeight: '500',
                color: 'var(--text-primary)',
                margin: '0',
              }}
            >
              Select Applications
            </h3>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center transition-colors duration-200 hover:opacity-70"
              style={{
                width: '24px',
                height: '24px',
                padding: '0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Close"
            >
              <X size={20} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Search Input */}
          <div
            className="relative"
            style={{
              width: '100%',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in  Applications"
              className="font-['Roboto']"
              style={{
                width: '100%',
                height: '36px',
                padding: '0 36px 0 12px',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-caption)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <div
              className="absolute"
              style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
        </div>

        {/* Category Tabs - Scrollable */}
        <div
          style={{
            position: 'relative',
            borderBottom: '1px solid rgba(113, 152, 255, 0.1)',
            backgroundColor: 'rgba(113, 152, 255, 0.05)',
          }}
        >
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollTabs('left')}
            className="absolute transition-opacity duration-200 hover:opacity-70"
            style={{
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '100%',
              background: 'linear-gradient(to right, var(--card) 50%, transparent)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '4px',
            }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--primary)' }} />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center"
            style={{
              overflowX: 'auto',
              scrollbarWidth: 'none',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md) var(--spacing-xl)',
            }}
          >
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="transition-all duration-200"
                style={{
                  padding: '6px 12px',
                  backgroundColor:
                    selectedCategory === category.id
                      ? 'var(--primary)'
                      : 'var(--card)',
                  border:
                    selectedCategory === category.id
                      ? '1px solid var(--primary)'
                      : '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  color:
                    selectedCategory === category.id
                      ? 'var(--primary-foreground)'
                      : 'var(--text-primary)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 'var(--font-weight-normal)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollTabs('right')}
            className="absolute transition-opacity duration-200 hover:opacity-70"
            style={{
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '100%',
              background: 'linear-gradient(to left, var(--card) 50%, transparent)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '4px',
            }}
          >
            <ChevronRight size={20} style={{ color: 'var(--primary)' }} />
          </button>
        </div>

        {/* Application List - Scrollable */}
        <div
          style={{
            flex: '1',
            overflowY: 'auto',
            minHeight: '0',
          }}
        >
          {Object.entries(groupedApps).map(([category, apps]) => {
            const categoryApps = APPLICATIONS.filter((app) => app.category === category);
            const allCategoryIds = categoryApps.map((app) => app.id);
            const allSelected = allCategoryIds.every((id) => selectedApps.includes(id));
            const someSelected = allCategoryIds.some((id) => selectedApps.includes(id));

            return (
              <div key={category}>
                {/* Category Header */}
                <div
                  className="flex items-center justify-between sticky top-0 z-10"
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    backgroundColor: 'var(--muted)',
                    borderBottom: '1px solid rgba(204, 212, 224, 0.5)',
                  }}
                >
                  <span
                    className="font-['Roboto']"
                    style={{
                      fontSize: 'var(--text-section-heading)',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    AVAILABLE {getCategoryLabel(category).toUpperCase()} APPLICATIONS
                  </span>
                  
                  {/* Select All Checkbox */}
                  <button
                    onClick={() => selectAllInCategory(category)}
                    className="inline-flex items-center justify-center transition-all duration-200"
                    style={{
                      width: '18px',
                      height: '18px',
                      backgroundColor: allSelected
                        ? 'var(--primary)'
                        : someSelected
                        ? 'var(--primary)'
                        : 'transparent',
                      border: allSelected || someSelected ? 'none' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      opacity: allSelected ? 1 : someSelected ? 0.6 : 1,
                    }}
                  >
                    {(allSelected || someSelected) && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        style={{ color: 'var(--primary-foreground)' }}
                      >
                        <path
                          d={svgPaths.p1098da98}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Application Items */}
                {apps.map((app) => {
                  const isSelected = selectedApps.includes(app.id);

                  return (
                    <div
                      key={app.id}
                      onClick={() => toggleApp(app.id)}
                      className="flex items-center justify-between transition-colors duration-200 hover:bg-[rgba(0,0,0,0.02)] cursor-pointer"
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        borderBottom: '1px solid rgba(204, 212, 224, 0.5)',
                      }}
                    >
                      <span
                        className="font-['Roboto']"
                        style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {app.name}
                      </span>

                      {/* Checkbox */}
                      <div
                        className="inline-flex items-center justify-center transition-all duration-200"
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                          border: isSelected ? 'none' : '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            style={{ color: 'var(--primary-foreground)' }}
                          >
                            <path
                              d={svgPaths.p1098da98}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {filteredApps.length === 0 && (
            <div
              className="flex items-center justify-center"
              style={{
                padding: 'var(--spacing-xl)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-base)',
              }}
            >
              No applications found
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--spacing-lg)',
            borderTop: '1px solid var(--border)',
            gap: 'var(--spacing-md)',
          }}
        >
          <span
            className="font-['Roboto']"
            style={{
              fontSize: 'var(--text-caption)',
              color: 'var(--text-secondary)',
            }}
          >
            {selectedApps.length} selected
          </span>

          <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center transition-all duration-200 hover:opacity-70"
              style={{
                height: '36px',
                padding: '0 20px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-base)',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="inline-flex items-center justify-center transition-all duration-200"
              style={{
                height: '36px',
                padding: '0 20px',
                backgroundColor: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-foreground)',
                fontSize: 'var(--text-base)',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}