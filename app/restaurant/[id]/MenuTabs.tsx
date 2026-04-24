"use client";

import { useState } from "react";
import { useCart } from "../../context/cart";
import { showToast } from "../../components/Toast";
import { useLang, t } from "../../context/language";
import CustomizationModal from "../../components/CustomizationModal";

type Item = {
  name: string;
  description?: string;
  price?: number;
  priceLbp?: number;
  size_options?: { size: string; price: number }[];
  customizations?: {
    remove_options?: string[];
    add_options?: string[];
  };
  is_new?: boolean;
  note?: string;
};

type Category = {
  name: string;
  note?: string;
  items?: Item[];
  add_ons?: { name: string; price?: number }[];
};

type Props = {
  restaurantId: string;
  restaurantName: string;
  categories: Category[];
  currencyNote: string;
};

function formatPrice(item: Item): string {
  if (item.price !== undefined) return `$${item.price}`;
  if (item.priceLbp !== undefined) {
    return item.priceLbp >= 1_000_000
      ? `${(item.priceLbp / 1_000_000).toFixed(2)}M LBP`
      : `${item.priceLbp.toLocaleString()} LBP`;
  }
  return "—";
}

function SizeAddButton({ item, size, price, restaurantId, restaurantName }: { item: Item; size: string; price: number; restaurantId: string; restaurantName: string }) {
  const { items, addItem, updateQty } = useCart();
  const itemName = `${item.name} (${size})`;
  const cartItem = items.find(i => i.restaurantId === restaurantId && i.name === itemName);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd() {
    addItem({ restaurantId, restaurantName, name: itemName, price: price, priceLbp: null });
    showToast(`${item.name} (${size})`);
  }

  if (qty === 0) {
    return (
      <button
        onClick={handleAdd}
        className="flex h-10 w-10 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#1AABBD] text-white shadow-sm transition hover:bg-[#168fa0] hover:scale-110 active:scale-95 touch-manipulation"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full bg-[#0C2B35] px-1 py-1">
      <button
        onClick={() => updateQty(restaurantId, itemName, qty - 1)}
        className="flex h-8 w-8 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 touch-manipulation"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14"/>
        </svg>
      </button>
      <span className="w-6 sm:w-4 text-center text-xs font-bold text-white">{qty}</span>
      <button
        onClick={() => updateQty(restaurantId, itemName, qty + 1)}
        className="flex h-8 w-8 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#1AABBD] text-white transition hover:bg-[#168fa0] touch-manipulation"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}

function AddButton({ item, restaurantId, restaurantName, removedIngredients, onIngredientsChange }: { 
  item: Item; 
  restaurantId: string; 
  restaurantName: string;
  removedIngredients: string[];
  onIngredientsChange: (removed: string[]) => void;
}) {
  const { items, addItem, updateQty } = useCart();
  const cartItem = items.find(i => i.restaurantId === restaurantId && i.name === item.name);
  const qty = cartItem?.quantity ?? 0;
  const [showCustomization, setShowCustomization] = useState(false);

  function handleAdd() {
    if (item.customizations && item.customizations.add_options && item.customizations.add_options.length > 0) {
      setShowCustomization(true);
    } else {
      const customizations = removedIngredients.length > 0 ? { remove: removedIngredients } : undefined;
      addItem({ 
        restaurantId, 
        restaurantName, 
        name: item.name, 
        price: item.price ?? null, 
        priceLbp: item.priceLbp ?? null,
        customizations
      });
      showToast(item.name);
    }
  }

  function handleCustomizedAdd(customizations: { remove: string[]; add: string[] }) {
    const finalCustomizations = {
      remove: [...removedIngredients, ...customizations.remove],
      add: customizations.add
    };
    addItem({ 
      restaurantId, 
      restaurantName, 
      name: item.name, 
      price: item.price ?? null, 
      priceLbp: item.priceLbp ?? null,
      customizations: finalCustomizations.remove.length > 0 || finalCustomizations.add.length > 0 ? finalCustomizations : undefined
    });
    showToast(item.name);
  }

  if (qty === 0) {
    return (
      <>
        <button
          onClick={handleAdd}
          className="flex h-10 w-10 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-[#1AABBD] text-white shadow-sm transition hover:bg-[#168fa0] hover:scale-110 active:scale-95 touch-manipulation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
        
        <CustomizationModal
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          item={item}
          onAddToCart={handleCustomizedAdd}
        />
      </>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-[#0C2B35] px-1 py-1">
      <button
        onClick={() => updateQty(restaurantId, item.name, qty - 1)}
        className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 touch-manipulation"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14"/>
        </svg>
      </button>
      <span className="w-6 sm:w-5 text-center text-xs font-bold text-white">{qty}</span>
      <button
        onClick={() => updateQty(restaurantId, item.name, qty + 1)}
        className="flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#1AABBD] text-white transition hover:bg-[#168fa0] touch-manipulation"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  );
}

function IngredientsRemover({ item, removedIngredients, onIngredientsChange }: {
  item: Item;
  removedIngredients: string[];
  onIngredientsChange: (removed: string[]) => void;
}) {
  const { lang } = useLang();
  
  if (!item.customizations?.remove_options || item.customizations.remove_options.length === 0) {
    return null;
  }

  const toggleIngredient = (ingredient: string) => {
    const newRemoved = removedIngredients.includes(ingredient)
      ? removedIngredients.filter(i => i !== ingredient)
      : [...removedIngredients, ingredient];
    onIngredientsChange(newRemoved);
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-slate-600 mb-2">
        {lang === "ar" ? "اضغط لإزالة المكونات:" : "Tap to remove ingredients:"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {item.customizations.remove_options.map((ingredient) => {
          const isRemoved = removedIngredients.includes(ingredient);
          return (
            <button
              key={ingredient}
              onClick={() => toggleIngredient(ingredient)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all ${
                isRemoved
                  ? "bg-red-50 border-red-200 text-red-700 line-through opacity-60"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              {isRemoved && "🚫 "}
              {ingredient.replace(/^No /, "")}
            </button>
          );
        })}
      </div>
      {removedIngredients.length > 0 && (
        <p className="mt-1.5 text-xs text-red-600 font-medium">
          {lang === "ar" 
            ? `${removedIngredients.length} مكون محذوف` 
            : `${removedIngredients.length} ingredient${removedIngredients.length === 1 ? '' : 's'} removed`
          }
        </p>
      )}
    </div>
  );
}

export default function MenuTabs({ restaurantId, restaurantName, categories, currencyNote }: Props) {
  const { lang } = useLang();
  const T = t[lang];
  const validCategories = categories.filter(c => c.items && c.items.length > 0);
  const [active, setActive] = useState(validCategories[0]?.name ?? "");
  const activeCategory = categories.find(c => c.name === active);
  
  // State for tracking removed ingredients per item
  const [itemRemovedIngredients, setItemRemovedIngredients] = useState<Record<string, string[]>>({});
  
  const handleIngredientsChange = (itemName: string, removedIngredients: string[]) => {
    setItemRemovedIngredients(prev => ({
      ...prev,
      [itemName]: removedIngredients
    }));
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1AABBD]/15 bg-white p-12 text-center">
        <p className="text-slate-400">{T.menu_coming_soon}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Sticky sidebar — desktop */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-24">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-400 uppercase">{T.menu_label}</p>
          <nav className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActive(cat.name)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm transition-all ${
                  active === cat.name
                    ? "bg-[#1AABBD] font-bold text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#EBF8FA] hover:text-[#0C2B35]"
                }`}
              >
                <span className="block truncate">{cat.name}</span>
                {cat.items && cat.items.length > 0 && (
                  <span className={`text-xs ${active === cat.name ? "text-white/70" : "text-slate-400"}`}>
                    {cat.items.length} items
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActive(cat.name)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active === cat.name
                  ? "bg-[#1AABBD] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-[#EBF8FA] hover:text-[#1AABBD]"
              }`}
            >
              {cat.name}
              {cat.items && cat.items.length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({cat.items.length})</span>
              )}
            </button>
          ))}
        </div>

        <p className="mb-5 text-xs italic text-slate-400">{currencyNote}</p>

        {activeCategory && (
          <>
            <div className="mb-5">
              <h2 className="text-2xl font-black tracking-tight text-[#0C2B35]">{activeCategory.name}</h2>
              {activeCategory.note && (
                <p className="mt-1 text-sm italic text-slate-500">{activeCategory.note}</p>
              )}
            </div>

            {activeCategory.items && activeCategory.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {activeCategory.items.map((item, i) => {
                  const removedIngredients = itemRemovedIngredients[item.name] || [];
                  return (
                    <div
                      key={i}
                      className="group flex items-start gap-4 rounded-2xl border border-[#1AABBD]/10 bg-white p-4 shadow-sm transition hover:border-[#1AABBD]/30 hover:shadow-md"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold leading-tight text-[#0C2B35]">{item.name}</h4>
                          {item.customizations && (
                            <span className="rounded-full bg-[#1AABBD]/10 px-2 py-0.5 text-xs font-bold text-[#1AABBD]">
                              🎛️ Customizable
                            </span>
                          )}
                          {item.is_new && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{T.menu_new}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm leading-relaxed text-slate-500 line-clamp-2">{item.description}</p>
                        )}
                        {item.note && item.note !== "Ask for price" && (
                          <p className="mt-1 text-xs italic text-amber-600">{item.note}</p>
                        )}
                        
                        {/* Ingredient removal interface */}
                        <IngredientsRemover
                          item={item}
                          removedIngredients={removedIngredients}
                          onIngredientsChange={(removed) => handleIngredientsChange(item.name, removed)}
                        />
                        
                        <div className="mt-2">
                          {item.size_options && item.size_options.length > 0 ? (
                            <div className="space-y-2">
                              {item.size_options.map((option, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="font-medium text-slate-600">{option.size}</span>
                                    <span className="ml-2 font-bold text-[#1AABBD]">${option.price}</span>
                                  </div>
                                  <SizeAddButton 
                                    item={item} 
                                    size={option.size} 
                                    price={option.price} 
                                    restaurantId={restaurantId} 
                                    restaurantName={restaurantName} 
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-base font-extrabold text-[#1AABBD]">
                              {item.note === "Ask for price" ? (
                                <span className="text-sm font-semibold text-slate-400 italic">{T.menu_ask_price}</span>
                              ) : (
                                formatPrice(item)
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {item.note !== "Ask for price" && !(item.size_options && item.size_options.length > 0) && (
                          <AddButton 
                            item={item} 
                            restaurantId={restaurantId} 
                            restaurantName={restaurantName}
                            removedIngredients={removedIngredients}
                            onIngredientsChange={(removed) => handleIngredientsChange(item.name, removed)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">{T.menu_no_items}</p>
            )}

            {activeCategory.add_ons && activeCategory.add_ons.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#1AABBD]/20 bg-[#EBF8FA] p-5">
                <p className="mb-3 text-sm font-bold text-[#0C2B35]">{T.menu_addons}</p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {activeCategory.add_ons.map((addon, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm">
                      <span className="text-slate-700">{addon.name}</span>
                      {addon.price !== undefined && (
                        <span className="ml-2 shrink-0 font-bold text-[#1AABBD]">+${addon.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
