import React, { useState, useEffect, useRef } from 'react';

interface Option {
    _id: string;
    fullName?: string;
    name?: string;
    phone?: string;
    [key: string]: any;
}

interface SearchableDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    onAddNew?: () => void;
    addNewLabel?: string;
    searchPlaceholder?: string;
    icon?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder,
    label,
    onAddNew,
    addNewLabel = "Add New",
    searchPlaceholder = "Search by name or phone...",
    icon = "search"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt._id === value);
    const displayName = selectedOption ? (selectedOption.fullName || selectedOption.name) : '';

    const filteredOptions = (options || []).filter(opt => {
        const name = (opt.fullName || opt.name || '').toLowerCase();
        const phone = (opt.phone || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || phone.includes(search);
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2.5 relative" ref={dropdownRef}>
            <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                {onAddNew && (
                     <button 
                        type="button"
                        onClick={onAddNew}
                        className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] opacity-60 hover:opacity-100 border border-[#D4AF37]/20 px-2 py-0.5 rounded transition-all"
                    >
                        {addNewLabel}
                    </button>
                )}
            </div>
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border ${isOpen ? 'border-[#006820] ring-2 ring-[#006820]/5' : 'border-[#dbe6df]'} rounded-lg transition-all text-left shadow-sm`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-lg text-gray-400 opacity-50">{icon}</span>
                    <span className={`text-[14px] font-bold truncate ${selectedOption ? 'text-forest-green' : 'text-gray-400'}`}>
                        {displayName || placeholder}
                    </span>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-400`}>
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-[#dbe6df] rounded-xl shadow-2xl z-100 animate-in fade-in zoom-in duration-200">
                    <div className="p-3 border-b border-[#f0f4f2]">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">search</span>
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-10 pr-4 py-2 bg-[#fbfcfa] border border-[#dbe6df] rounded-lg text-sm focus:ring-2 focus:ring-[#006820]/10 focus:border-[#006820] outline-none transition-all placeholder:text-gray-400"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-[280px] overflow-y-auto p-2">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option._id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option._id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-lg transition-colors text-left ${value === option._id ? 'bg-[#006820]/5 text-[#006820]' : 'hover:bg-[#fbfcfa]'}`}
                                >
                                    <span className="text-[13px] font-bold">
                                        {option.fullName || option.name}
                                    </span>
                                    {option.phone && (
                                        <span className="text-[11px] font-medium opacity-60 italic">
                                            {option.phone}
                                        </span>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="py-8 px-4 text-center">
                                <div className="text-gray-400 mb-3 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl opacity-20 mb-1">person_search</span>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No records found</p>
                                </div>
                                {onAddNew && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAddNew();
                                            setIsOpen(false);
                                        }}
                                        className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline underline-offset-4"
                                    >
                                        + {addNewLabel}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
