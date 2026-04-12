"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ar";

export const t = {
  en: {
    // Navbar
    nav_location: "Anfeh, Lebanon 🇱🇧",
    nav_cart: "Cart",
    // Hero
    hero_badge: "Now delivering · Anfeh, North Lebanon",
    hero_h1a: "What do you have",
    hero_h1b: "a taste for?",
    hero_sub: (r: number, i: number) => `${r} restaurants & ${i}+ items. Order via WhatsApp in seconds.`,
    hero_cta: "Browse Restaurants",
    // How it works
    how: [
      { icon: "🍽️", title: "Browse", desc: "Pick any restaurant and explore their full menu." },
      { icon: "🛒", title: "Add to Cart", desc: "Tap + on items to build your order." },
      { icon: "💬", title: "Order on WhatsApp", desc: "Fill in your details and send in one tap." },
    ],
    // Grid
    grid_title: "Restaurants",
    grid_search: "Search a restaurant…",
    grid_open: "Open now",
    grid_categories: "categories",
    grid_items: "items",
    grid_view: "View Menu",
    grid_empty: "No restaurants found",
    // Cart
    cart_title: "Your Order",
    cart_empty: "Your cart is empty",
    cart_empty_sub: "Browse restaurants and add items to get started",
    cart_section_items: "Items",
    cart_section_delivery: "Delivery Details",
    cart_name: "Full Name",
    cart_phone: "Phone Number",
    cart_area: "Delivery Area",
    cart_address: "Delivery Address",
    cart_notes: "Special Instructions",
    cart_optional: "(optional)",
    cart_subtotal: "Subtotal",
    cart_delivery: "Delivery",
    cart_total: "Total",
    cart_btn: "Place Order via WhatsApp",
    cart_clear: "Clear cart",
    cart_each: "each",
    cart_err_name: "Please enter your full name",
    cart_err_phone: "Please enter your phone number",
    cart_err_address: "Please enter your delivery location",
    // Restaurant
    back: "All Restaurants",
    open_now: "Open Now",
    // Menu
    menu_label: "Menu",
    menu_new: "New",
    menu_ask_price: "Ask for price",
    menu_no_items: "No items listed yet.",
    menu_coming_soon: "Menu coming soon.",
    menu_addons: "Available Add-ons",
    // Toast
    toast_added: "added",
  },
  ar: {
    nav_location: "عنفه، لبنان 🇱🇧",
    nav_cart: "السلة",
    hero_badge: "نوصّل الآن · عنفه، شمال لبنان",
    hero_h1a: "على ماذا",
    hero_h1b: "تشتهي؟",
    hero_sub: (r: number, i: number) => `${r} مطعم و ${i}+ صنف. اطلب عبر واتساب في ثوانٍ.`,
    hero_cta: "تصفّح المطاعم",
    how: [
      { icon: "🍽️", title: "تصفّح", desc: "اختر أي مطعم وتصفّح قائمته الكاملة." },
      { icon: "🛒", title: "أضف إلى السلة", desc: "اضغط + على الأصناف لبناء طلبك." },
      { icon: "💬", title: "اطلب عبر واتساب", desc: "أدخل بياناتك وأرسل بضغطة واحدة." },
    ],
    grid_title: "المطاعم",
    grid_search: "ابحث عن مطعم…",
    grid_open: "مفتوح الآن",
    grid_categories: "تصنيفات",
    grid_items: "صنف",
    grid_view: "عرض القائمة",
    grid_empty: "لا توجد مطاعم",
    cart_title: "طلبك",
    cart_empty: "سلتك فارغة",
    cart_empty_sub: "تصفّح المطاعم وأضف أصنافاً للبدء",
    cart_section_items: "الأصناف",
    cart_section_delivery: "تفاصيل التوصيل",
    cart_name: "الاسم الكامل",
    cart_phone: "رقم الهاتف",
    cart_area: "منطقة التوصيل",
    cart_address: "عنوان التوصيل",
    cart_notes: "ملاحظات خاصة",
    cart_optional: "(اختياري)",
    cart_subtotal: "المجموع",
    cart_delivery: "التوصيل",
    cart_total: "الإجمالي",
    cart_btn: "اطلب عبر واتساب",
    cart_clear: "مسح السلة",
    cart_each: "للقطعة",
    cart_err_name: "الرجاء إدخال الاسم الكامل",
    cart_err_phone: "الرجاء إدخال رقم الهاتف",
    cart_err_address: "الرجاء إدخال عنوان التوصيل",
    back: "كل المطاعم",
    open_now: "مفتوح الآن",
    menu_label: "القائمة",
    menu_new: "جديد",
    menu_ask_price: "اسأل عن السعر",
    menu_no_items: "لا توجد أصناف بعد.",
    menu_coming_soon: "القائمة قريباً.",
    menu_addons: "الإضافات المتاحة",
    toast_added: "أُضيف",
  },
};

type LangCtx = { lang: Lang; setLang: (l: Lang) => void };
const LangContext = createContext<LangCtx>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  function setLang(l: Lang) {
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", l);
  }

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ar") setLang("ar");
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
