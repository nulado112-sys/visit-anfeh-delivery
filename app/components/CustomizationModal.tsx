"use client";

import { useState } from "react";
import { useLang, t } from "../context/language";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    price?: number;
    priceLbp?: number;
    customizations?: {
      remove_options?: string[];
      add_options?: string[];
    };
  };
  onAddToCart: (customizations: { remove: string[]; add: string[] }) => void;
};

export default function CustomizationModal({ isOpen, onClose, item, onAddToCart }: Props) {
  const { lang } = useLang();
  const T = t[lang];
  
  const [selectedRemove, setSelectedRemove] = useState<string[]>([]);
  const [selectedAdd, setSelectedAdd] = useState<string[]>([]);

  const handleAddToCart = () => {
    onAddToCart({ remove: selectedRemove, add: selectedAdd });
    setSelectedRemove([]);
    setSelectedAdd([]);
    onClose();
  };

  const toggleRemove = (option: string) => {
    setSelectedRemove(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const toggleAdd = (option: string) => {
    setSelectedAdd(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-[#0C2B35]">
                {lang === "ar" ? "تخصيص الطلب" : "Customize Your Order"}
              </h3>
              <p className="text-sm text-slate-500 font-medium">{item.name}</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Remove Options */}
          {item.customizations?.remove_options && item.customizations.remove_options.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-[#0C2B35] mb-3">
                {lang === "ar" ? "إزالة المكونات:" : "Remove Ingredients:"}
              </h4>
              <div className="space-y-2">
                {item.customizations.remove_options.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRemove.includes(option)}
                      onChange={() => toggleRemove(option)}
                      className="w-4 h-4 text-[#1AABBD] border-slate-300 rounded focus:ring-[#1AABBD]"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add Options */}
          {item.customizations?.add_options && item.customizations.add_options.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-[#0C2B35] mb-3">
                {lang === "ar" ? "إضافات:" : "Add Extras:"}
              </h4>
              <div className="space-y-2">
                {item.customizations.add_options.map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAdd.includes(option)}
                      onChange={() => toggleAdd(option)}
                      className="w-4 h-4 text-[#1AABBD] border-slate-300 rounded focus:ring-[#1AABBD]"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-2xl bg-[#1AABBD] text-sm font-bold text-white hover:bg-[#168fa0]"
            >
              {lang === "ar" ? "إضافة للسلة" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}