import React, { forwardRef, useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { AlertCircle, AlertTriangle, ArrowDown, ArrowDownRight, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpRight, BarChart3, Bell, BellRing, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Database, Edit3, Filter, HelpCircle, Info, Layers, LayoutDashboard, LogOut, Menu, Minus, Moon, RefreshCw, Search, Settings, Shield, Sparkles, Sun, Trash2, TrendingUp, User, UserPlus, Users, X } from "lucide-react";
import { Head, Link, createInertiaApp, router, usePage } from "@inertiajs/react";
import { create } from "zustand";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { persist } from "zustand/middleware";
import createServer from "@inertiajs/react/server";
import ReactDOMServer from "react-dom/server";
// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
// resources/js/stores/useSidebarStore.js
var useSidebarStore = create((set) => ({
	isCollapsed: false,
	isMobileOpen: false,
	toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
	setCollapsed: (val) => set({ isCollapsed: val }),
	toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
	closeMobile: () => set({ isMobileOpen: false })
}));
// resources/js/components/organisms/Sidebar.jsx
function Sidebar() {
	const { url } = usePage();
	const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useSidebarStore();
	const navigation = [
		{
			name: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
			active: url.startsWith("/dashboard") || url === "/"
		},
		{
			name: "Data Pengguna (SSR)",
			href: "/users",
			icon: Users,
			badge: "SSR",
			badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
			active: url.startsWith("/users")
		},
		{
			name: "Analytics",
			href: "/analytics",
			icon: BarChart3,
			active: url.startsWith("/analytics")
		},
		{
			name: "Pengaturan",
			href: "/settings",
			icon: Settings,
			active: url.startsWith("/settings")
		}
	];
	const sidebarContent = /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col h-full justify-between",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800",
			children: [/* @__PURE__ */ jsxs(Link, {
				href: "/dashboard",
				className: "flex items-center gap-3 overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0",
					children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5" })
				}), !isCollapsed && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-bold text-sm text-slate-900 dark:text-white tracking-tight",
						children: "Laravel 12"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase",
						children: "Atomic Dashboard"
					})]
				})]
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: closeMobile,
				className: "md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
				children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
			})]
		}), /* @__PURE__ */ jsxs("nav", {
			className: "p-3 space-y-1",
			children: [/* @__PURE__ */ jsx("div", {
				className: `px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${isCollapsed ? "hidden" : "block"}`,
				children: "Menu Utama"
			}), navigation.map((item) => {
				const Icon = item.icon;
				return /* @__PURE__ */ jsxs(Link, {
					href: item.href,
					onClick: closeMobile,
					className: `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${item.active ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}`,
					title: isCollapsed ? item.name : void 0,
					children: [
						/* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 shrink-0 ${item.active ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}` }),
						!isCollapsed && /* @__PURE__ */ jsx("span", {
							className: "flex-1 truncate",
							children: item.name
						}),
						!isCollapsed && item.badge && /* @__PURE__ */ jsx("span", {
							className: `text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || "bg-slate-100 text-slate-700"}`,
							children: item.badge
						})
					]
				}, item.name);
			})]
		})] }), /* @__PURE__ */ jsxs("div", {
			className: "p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2",
			children: [!isCollapsed && /* @__PURE__ */ jsxs("div", {
				className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
					children: /* @__PURE__ */ jsx(Shield, { className: "w-4 h-4" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-[11px] leading-tight",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-semibold text-slate-800 dark:text-slate-200",
						children: "Zustand + SSR"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-400 text-[10px]",
						children: "React Atomic Design"
					})]
				})]
			}), /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: toggleCollapse,
				className: "hidden md:flex w-full items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
				title: isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar",
				children: [/* @__PURE__ */ jsx(ChevronLeft, { className: `w-4 h-4 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}` }), !isCollapsed && /* @__PURE__ */ jsx("span", {
					className: "text-xs ml-2",
					children: "Ciutkan Sidebar"
				})]
			})]
		})]
	});
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("aside", {
			className: `hidden md:block fixed top-0 left-0 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"}`,
			children: sidebarContent
		}),
		isMobileOpen && /* @__PURE__ */ jsx("div", {
			className: "md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity",
			onClick: closeMobile
		}),
		/* @__PURE__ */ jsx("aside", {
			className: `md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`,
			children: sidebarContent
		})
	] });
}
// resources/js/stores/useThemeStore.js
var useThemeStore = create(persist((set, get) => ({
	theme: "light",
	setTheme: (newTheme) => {
		set({ theme: newTheme });
		get().applyThemeToDom(newTheme);
	},
	toggleTheme: () => {
		const nextTheme = get().theme === "dark" ? "light" : "dark";
		set({ theme: nextTheme });
		get().applyThemeToDom(nextTheme);
	},
	applyThemeToDom: (targetTheme) => {
		if (typeof window === "undefined") return;
		const root = document.documentElement;
		if (targetTheme === "dark") root.classList.add("dark");
		else root.classList.remove("dark");
	},
	initTheme: () => {
		if (typeof window === "undefined") return;
		const currentTheme = get().theme;
		get().applyThemeToDom(currentTheme);
	}
}), { name: "theme-storage" }));
// resources/js/components/atoms/Avatar.jsx
function Avatar({ src, name = "", size = "md", status = null, className = "" }) {
	const [hasError, setHasError] = useState(false);
	const sizes = {
		sm: "w-7 h-7 text-xs",
		md: "w-9 h-9 text-sm",
		lg: "w-12 h-12 text-base",
		xl: "w-16 h-16 text-xl"
	};
	const statusColors = {
		online: "bg-emerald-500",
		offline: "bg-slate-400",
		busy: "bg-rose-500"
	};
	const getInitials = (str) => {
		if (!str) return "U";
		const parts = str.trim().split(" ");
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return str.substring(0, 2).toUpperCase();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `relative inline-block shrink-0 ${className}`,
		children: [src && !hasError ? /* @__PURE__ */ jsx("img", {
			src,
			alt: name,
			onError: () => setHasError(true),
			className: `rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${sizes[size] || sizes.md}`
		}) : /* @__PURE__ */ jsx("div", {
			className: `rounded-full flex items-center justify-center font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-white dark:ring-slate-800 select-none ${sizes[size] || sizes.md}`,
			children: getInitials(name)
		}), status && /* @__PURE__ */ jsx("span", { className: `absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-900 w-2.5 h-2.5 ${statusColors[status] || statusColors.online}` })]
	});
}
// resources/js/components/molecules/UserProfileDropdown.jsx
function UserProfileDropdown({ user = null, className = "" }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const { theme, toggleTheme } = useThemeStore();
	const currentUser = user || {
		name: "Ahmad Fauzi",
		email: "admin@example.com",
		role: "Administrator",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
	};
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: `relative ${className}`,
		ref: dropdownRef,
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: () => setIsOpen(!isOpen),
			className: "flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none",
			children: [
				/* @__PURE__ */ jsx(Avatar, {
					src: currentUser.avatar,
					name: currentUser.name,
					size: "sm",
					status: "online"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hidden md:block text-left text-xs leading-tight",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-semibold text-slate-800 dark:text-slate-200",
						children: currentUser.name
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 dark:text-slate-400 capitalize",
						children: currentUser.role || "Super Admin"
					})]
				}),
				/* @__PURE__ */ jsx(ChevronDown, { className: "w-3.5 h-3.5 text-slate-400 hidden md:block" })
			]
		}), isOpen && /* @__PURE__ */ jsxs("div", {
			className: "absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 py-1.5 z-50 text-xs",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "px-4 py-2.5 border-b border-slate-100 dark:border-slate-800",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-semibold text-slate-900 dark:text-white truncate",
						children: currentUser.name
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-500 dark:text-slate-400 truncate mt-0.5",
						children: currentUser.email
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "py-1",
					children: [
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => {
								toggleTheme();
								setIsOpen(false);
							},
							className: "w-full flex items-center justify-between px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-2.5",
								children: [theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-amber-500" }) : /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4 text-indigo-500" }), /* @__PURE__ */ jsx("span", { children: theme === "dark" ? "Mode Terang (Light)" : "Mode Gelap (Dark)" })]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded",
								children: theme
							})]
						}),
						/* @__PURE__ */ jsxs(Link, {
							href: "/settings",
							onClick: () => setIsOpen(false),
							className: "flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
							children: [/* @__PURE__ */ jsx(Settings, { className: "w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx("span", { children: "Pengaturan Akun" })]
						}),
						/* @__PURE__ */ jsxs(Link, {
							href: "/users",
							onClick: () => setIsOpen(false),
							className: "flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
							children: [/* @__PURE__ */ jsx(Shield, { className: "w-4 h-4 text-slate-400" }), /* @__PURE__ */ jsx("span", { children: "Kelola Pengguna" })]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-t border-slate-100 dark:border-slate-800 pt-1",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							setIsOpen(false);
							alert("Contoh logout");
						},
						className: "w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors",
						children: [/* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Keluar (Logout)" })]
					})
				})
			]
		})]
	});
}
// resources/js/components/organisms/Navbar.jsx
function Navbar({ title = "Dashboard", breadcrumbs = [] }) {
	const { toggleMobile } = useSidebarStore();
	const { theme, toggleTheme } = useThemeStore();
	return /* @__PURE__ */ jsx("header", {
		className: "sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between h-full px-4 sm:px-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: toggleMobile,
					className: "md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none",
					children: /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500",
					children: [/* @__PURE__ */ jsx("span", { children: "Beranda" }), breadcrumbs.map((crumb, idx) => /* @__PURE__ */ jsxs(React.Fragment, { children: [/* @__PURE__ */ jsx("span", { children: "/" }), /* @__PURE__ */ jsx("span", {
						className: "text-slate-600 dark:text-slate-400",
						children: crumb
					})] }, idx))]
				}), /* @__PURE__ */ jsx("h1", {
					className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight",
					children: title
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 sm:gap-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: toggleTheme,
						className: "p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer",
						title: theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap",
						children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" }) : /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4 text-slate-600 animate-in spin-in-180 duration-300" })
					}),
					/* @__PURE__ */ jsx("div", {
						className: "relative",
						children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
							title: "Pemberitahuan",
							children: [/* @__PURE__ */ jsx(Bell, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" })]
						})
					}),
					/* @__PURE__ */ jsx("div", { className: "h-5 w-px bg-slate-200 dark:bg-slate-800" }),
					/* @__PURE__ */ jsx(UserProfileDropdown, {})
				]
			})]
		})
	});
}
// resources/js/stores/useAlertStore.js
var useAlertStore = create((set, get) => ({
	alerts: [],
	confirmState: {
		isOpen: false,
		title: "",
		message: "",
		confirmButtonText: "Ya, Lanjutkan",
		cancelButtonText: "Batal",
		type: "danger",
		resolve: null
	},
	/**
	* Add a notification toast to queue
	*/
	addAlert: (alert) => {
		const id = alert.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		const newAlert = {
			id,
			type: alert.type || "info",
			title: alert.title || "Notifikasi",
			message: alert.message || "",
			duration: alert.duration || 4500
		};
		set((state) => ({ alerts: [...state.alerts, newAlert] }));
		if (newAlert.duration > 0) setTimeout(() => {
			get().removeAlert(id);
		}, newAlert.duration);
		return id;
	},
	/**
	* Remove an alert by its ID
	*/
	removeAlert: (id) => {
		set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
	},
	/**
	* Open confirmation modal - returns a Promise resolving to boolean
	*/
	confirm: (options) => {
		return new Promise((resolve) => {
			set({ confirmState: {
				isOpen: true,
				title: options.title || "Konfirmasi Tindakan",
				message: options.message || "Apakah Anda yakin ingin melanjutkan tindakan ini?",
				confirmButtonText: options.confirmButtonText || "Ya, Lanjutkan",
				cancelButtonText: options.cancelButtonText || "Batal",
				type: options.type || "danger",
				resolve
			} });
		});
	},
	/**
	* Confirm modal action chosen
	*/
	closeConfirm: (result = false) => {
		const { resolve } = get().confirmState;
		if (typeof resolve === "function") resolve(result);
		set((state) => ({ confirmState: {
			...state.confirmState,
			isOpen: false,
			resolve: null
		} }));
	},
	/**
	* Process Laravel Notify payload passed from Inertia flash props
	*/
	processLaravelNotify: (notifyPayload) => {
		if (!notifyPayload) return;
		if (notifyPayload.type === "confirm") {
			get().confirm({
				title: notifyPayload.title,
				message: notifyPayload.message,
				confirmButtonText: notifyPayload.confirmButtonText,
				cancelButtonText: notifyPayload.cancelButtonText,
				type: "warning"
			});
			return;
		}
		get().addAlert({
			id: notifyPayload.id,
			type: notifyPayload.type,
			title: notifyPayload.title,
			message: notifyPayload.message,
			duration: notifyPayload.duration || 5e3
		});
	}
}));
// resources/js/components/molecules/NotificationToast.jsx
function NotificationToast({ alert, onDismiss }) {
	const { id, type = "info", title, message } = alert;
	const config = {
		success: {
			icon: CheckCircle2,
			iconColor: "text-emerald-500 dark:text-emerald-400",
			borderColor: "border-emerald-200 dark:border-emerald-800/60",
			bgColor: "bg-white dark:bg-slate-900",
			tag: "Berhasil",
			tagColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
		},
		error: {
			icon: AlertCircle,
			iconColor: "text-rose-500 dark:text-rose-400",
			borderColor: "border-rose-200 dark:border-rose-800/60",
			bgColor: "bg-white dark:bg-slate-900",
			tag: "Gagal",
			tagColor: "text-rose-600 bg-rose-50 dark:bg-rose-950/50"
		},
		warning: {
			icon: AlertTriangle,
			iconColor: "text-amber-500 dark:text-amber-400",
			borderColor: "border-amber-200 dark:border-amber-800/60",
			bgColor: "bg-white dark:bg-slate-900",
			tag: "Peringatan",
			tagColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/50"
		},
		info: {
			icon: Info,
			iconColor: "text-indigo-500 dark:text-indigo-400",
			borderColor: "border-indigo-200 dark:border-indigo-800/60",
			bgColor: "bg-white dark:bg-slate-900",
			tag: "Info",
			tagColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
		}
	};
	const current = config[type] || config.info;
	const Icon = current.icon;
	return /* @__PURE__ */ jsxs("div", {
		className: `w-88 max-w-full rounded-xl border ${current.borderColor} ${current.bgColor} p-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 transform translate-y-0 flex items-start gap-3 relative`,
		role: "alert",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: `shrink-0 mt-0.5 ${current.iconColor}`,
				children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 min-w-0 pr-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 mb-1",
					children: [/* @__PURE__ */ jsx("span", {
						className: `text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${current.tagColor}`,
						children: current.tag
					}), /* @__PURE__ */ jsx("h4", {
						className: "text-xs font-semibold text-slate-900 dark:text-white truncate",
						children: title
					})]
				}), message && /* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words",
					children: message
				})]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onDismiss(id),
				className: "absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1 transition-colors",
				title: "Tutup Notifikasi",
				children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
			})
		]
	});
}
// resources/js/components/atoms/Spinner.jsx
function Spinner({ size = "md", className = "" }) {
	const sizes = {
		sm: "w-4 h-4 border-2",
		md: "w-5 h-5 border-2",
		lg: "w-8 h-8 border-3"
	};
	return /* @__PURE__ */ jsx("div", {
		className: `inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizes[size] || sizes.md} ${className}`,
		role: "status",
		children: /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Loading..."
		})
	});
}
// resources/js/components/atoms/Button.jsx
function Button({ children, type = "button", variant = "primary", size = "md", isLoading = false, disabled = false, className = "", icon: Icon = null, iconPosition = "left", ...props }) {
	const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
	const variants = {
		primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-none dark:bg-indigo-500 dark:hover:bg-indigo-600",
		secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
		outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
		danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-200 dark:shadow-none dark:bg-rose-600 dark:hover:bg-rose-700",
		success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none dark:bg-emerald-600 dark:hover:bg-emerald-700",
		ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
	};
	const sizes = {
		sm: "text-xs px-3 py-1.5 gap-1.5",
		md: "text-sm px-4 py-2 gap-2",
		lg: "text-base px-5 py-2.5 gap-2.5"
	};
	return /* @__PURE__ */ jsxs("button", {
		type,
		disabled: disabled || isLoading,
		className: `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`,
		...props,
		children: [
			isLoading && /* @__PURE__ */ jsx(Spinner, { size: "sm" }),
			!isLoading && Icon && iconPosition === "left" && /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 shrink-0" }),
			/* @__PURE__ */ jsx("span", { children }),
			!isLoading && Icon && iconPosition === "right" && /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 shrink-0" })
		]
	});
}
// resources/js/components/molecules/ConfirmModal.jsx
function ConfirmModal() {
	const { confirmState, closeConfirm } = useAlertStore();
	const { isOpen, title, message, confirmButtonText, cancelButtonText, type } = confirmState;
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) closeConfirm(false);
		};
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, closeConfirm]);
	if (!isOpen) return null;
	const icons = {
		danger: {
			icon: AlertTriangle,
			iconClass: "text-rose-600 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400",
			buttonVariant: "danger"
		},
		warning: {
			icon: AlertTriangle,
			iconClass: "text-amber-600 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400",
			buttonVariant: "primary"
		},
		info: {
			icon: Info,
			iconClass: "text-indigo-600 bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400",
			buttonVariant: "primary"
		}
	};
	const currentConfig = icons[type] || icons.danger;
	const Icon = currentConfig.icon;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 overflow-y-auto",
		children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity",
			onClick: () => closeConfirm(false)
		}), /* @__PURE__ */ jsx("div", {
			className: "flex min-h-full items-center justify-center p-4 text-center sm:p-0",
			children: /* @__PURE__ */ jsxs("div", {
				className: "relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200 dark:border-slate-800 p-6",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: `p-3 rounded-full shrink-0 ${currentConfig.iconClass}`,
						children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6" })
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex-1 mt-0.5",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-base font-semibold text-slate-900 dark:text-white",
							children: title
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed",
							children: message
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5",
					children: [/* @__PURE__ */ jsx(Button, {
						variant: "secondary",
						onClick: () => closeConfirm(false),
						className: "w-full sm:w-auto",
						children: cancelButtonText
					}), /* @__PURE__ */ jsx(Button, {
						variant: currentConfig.buttonVariant,
						onClick: () => closeConfirm(true),
						className: "w-full sm:w-auto",
						children: confirmButtonText
					})]
				})]
			})
		})]
	});
}
// resources/js/components/organisms/AlertContainer.jsx
function AlertContainer() {
	const { alerts, removeAlert, processLaravelNotify } = useAlertStore();
	const { flash } = usePage().props;
	const lastFlashIdRef = useRef(null);
	useEffect(() => {
		if (!flash) return;
		if (flash.notify && flash.notify.id !== lastFlashIdRef.current) {
			lastFlashIdRef.current = flash.notify.id;
			processLaravelNotify(flash.notify);
			return;
		}
		[
			"success",
			"error",
			"warning",
			"info"
		].forEach((type) => {
			if (flash[type] && typeof flash[type] === "string") {
				const uniqueKey = `${type}_${flash[type]}`;
				if (lastFlashIdRef.current !== uniqueKey) {
					lastFlashIdRef.current = uniqueKey;
					processLaravelNotify({
						id: uniqueKey,
						type,
						title: type === "success" ? "Berhasil" : type === "error" ? "Gagal" : "Pemberitahuan",
						message: flash[type]
					});
				}
			}
		});
	}, [flash, processLaravelNotify]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ConfirmModal, {}), /* @__PURE__ */ jsx("div", {
		"aria-live": "assertive",
		className: "fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none",
		children: alerts.map((alert) => /* @__PURE__ */ jsx("div", {
			className: "pointer-events-auto",
			children: /* @__PURE__ */ jsx(NotificationToast, {
				alert,
				onDismiss: removeAlert
			})
		}, alert.id))
	})] });
}
// resources/js/components/templates/DashboardLayout.jsx
function DashboardLayout({ children, title = "Dashboard", breadcrumbs = [] }) {
	const { isCollapsed } = useSidebarStore();
	const { initTheme } = useThemeStore();
	useEffect(() => {
		initTheme();
	}, [initTheme]);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200",
		children: [
			/* @__PURE__ */ jsx(Head, { title }),
			/* @__PURE__ */ jsx(AlertContainer, {}),
			/* @__PURE__ */ jsx(Sidebar, {}),
			/* @__PURE__ */ jsxs("div", {
				className: `flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? "md:pl-20" : "md:pl-64"}`,
				children: [
					/* @__PURE__ */ jsx(Navbar, {
						title,
						breadcrumbs
					}),
					/* @__PURE__ */ jsx("main", {
						className: "flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6",
						children
					}),
					/* @__PURE__ */ jsx("footer", {
						className: "py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500",
						children: "Laravel 12 + Inertia React + Tailwind CSS + Zustand | Atomic Design Architecture"
					})
				]
			})
		]
	});
}
// resources/js/Pages/Analytics/Index.jsx
var Index_exports$3 = /* @__PURE__ */ __exportAll({ default: () => AnalyticsIndex });
function AnalyticsIndex() {
	return /* @__PURE__ */ jsx(DashboardLayout, {
		title: "Arsitektur & Analytics",
		breadcrumbs: ["Analytics"],
		children: /* @__PURE__ */ jsx("div", {
			className: "space-y-6",
			children: /* @__PURE__ */ jsxs("div", {
				className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
						children: /* @__PURE__ */ jsx(Layers, { className: "w-5 h-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "text-base font-bold text-slate-900 dark:text-white",
						children: "Arsitektur React Atomic Design"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500 dark:text-slate-400",
						children: "Struktur folder dan komponen modular yang terorganisir dari unit terkecil hingga halaman utuh."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
					children: [
						{
							level: "Atoms",
							color: "bg-emerald-500",
							description: "Elemen UI paling mendasar yang tidak dapat dipecah lagi.",
							items: [
								"Button",
								"Input",
								"Select",
								"Badge",
								"Label",
								"Spinner",
								"ToggleSwitch",
								"Avatar"
							]
						},
						{
							level: "Molecules",
							color: "bg-indigo-500",
							description: "Gabungan beberapa atom yang berfungsi bersama untuk tujuan spesifik.",
							items: [
								"SearchBar",
								"FormField",
								"StatCard",
								"PaginationControls",
								"NotificationToast",
								"ConfirmModal",
								"FilterDropdown",
								"UserProfileDropdown"
							]
						},
						{
							level: "Organisms",
							color: "bg-purple-500",
							description: "Komponen kompleks yang membentuk bagian utuh dari antarmuka.",
							items: [
								"Sidebar",
								"Navbar",
								"DataTable",
								"AlertContainer",
								"DashboardMetrics",
								"QuickActionPanel"
							]
						},
						{
							level: "Templates",
							color: "bg-amber-500",
							description: "Tata letak yang menggabungkan organisme ke dalam struktur halaman.",
							items: ["DashboardLayout"]
						},
						{
							level: "Pages",
							color: "bg-rose-500",
							description: "Halaman konkret yang diisi dengan data aktual dari server Laravel.",
							items: [
								"Dashboard/Index",
								"Users/Index (SSR)",
								"Analytics/Index",
								"Settings/Index"
							]
						}
					].map((atomic, idx) => /* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ jsx("span", { className: `w-3 h-3 rounded-full ${atomic.color}` }), /* @__PURE__ */ jsx("h4", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: atomic.level
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500 dark:text-slate-400 mb-3",
							children: atomic.description
						})] }), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50",
							children: atomic.items.map((item, itemIdx) => /* @__PURE__ */ jsx("span", {
								className: "text-[10px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300",
								children: item
							}, itemIdx))
						})]
					}, idx))
				})]
			})
		})
	});
}
// resources/js/components/molecules/StatCard.jsx
function StatCard({ title, value, change, trend = "up", description = "", iconName = "Users", color = "indigo", className = "" }) {
	const IconComponent = Icons[iconName] || Icons.Activity;
	const colorMap = {
		indigo: {
			bg: "bg-indigo-50 dark:bg-indigo-950/50",
			text: "text-indigo-600 dark:text-indigo-400",
			border: "border-indigo-100 dark:border-indigo-900/50"
		},
		emerald: {
			bg: "bg-emerald-50 dark:bg-emerald-950/50",
			text: "text-emerald-600 dark:text-emerald-400",
			border: "border-emerald-100 dark:border-emerald-900/50"
		},
		purple: {
			bg: "bg-purple-50 dark:bg-purple-950/50",
			text: "text-purple-600 dark:text-purple-400",
			border: "border-purple-100 dark:border-purple-900/50"
		},
		rose: {
			bg: "bg-rose-50 dark:bg-rose-950/50",
			text: "text-rose-600 dark:text-rose-400",
			border: "border-rose-100 dark:border-rose-900/50"
		}
	};
	const activeColor = colorMap[color] || colorMap.indigo;
	return /* @__PURE__ */ jsxs("div", {
		className: `p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${className}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400",
				children: title
			}), /* @__PURE__ */ jsx("h3", {
				className: "mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
				children: value
			})] }), /* @__PURE__ */ jsx("div", {
				className: `p-3 rounded-xl ${activeColor.bg} ${activeColor.text}`,
				children: /* @__PURE__ */ jsx(IconComponent, { className: "w-5 h-5" })
			})]
		}), (change || description) && /* @__PURE__ */ jsxs("div", {
			className: "mt-4 flex items-center gap-2 text-xs",
			children: [change && /* @__PURE__ */ jsxs("span", {
				className: `inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md ${trend === "up" ? "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60" : trend === "down" ? "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60" : "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800"}`,
				children: [
					trend === "up" && /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-3.5 h-3.5 mr-0.5" }),
					trend === "down" && /* @__PURE__ */ jsx(ArrowDownRight, { className: "w-3.5 h-3.5 mr-0.5" }),
					trend === "neutral" && /* @__PURE__ */ jsx(Minus, { className: "w-3 h-3 mr-0.5" }),
					change
				]
			}), description && /* @__PURE__ */ jsx("span", {
				className: "text-slate-500 dark:text-slate-400 truncate",
				children: description
			})]
		})]
	});
}
// resources/js/components/organisms/DashboardMetrics.jsx
function DashboardMetrics({ metrics = [] }) {
	if (!metrics || metrics.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
		children: metrics.map((item, idx) => /* @__PURE__ */ jsx(StatCard, {
			title: item.title,
			value: item.value,
			change: item.change,
			trend: item.trend,
			description: item.description,
			iconName: item.icon,
			color: item.color
		}, idx))
	});
}
// resources/js/components/organisms/QuickActionPanel.jsx
function QuickActionPanel() {
	const [loadingType, setLoadingType] = useState(null);
	const { confirm, addAlert } = useAlertStore();
	const triggerServerNotify = (type) => {
		setLoadingType(type);
		router.post("/dashboard/notify-test", { type }, {
			preserveScroll: true,
			onFinish: () => setLoadingType(null)
		});
	};
	const triggerClientConfirm = async () => {
		if (await confirm({
			title: "Konfirmasi Penghapusan Cache?",
			message: "Tindakan ini akan membersihkan semua temporary view dan cache sesi pengguna.",
			confirmButtonText: "Ya, Bersihkan Sekarang",
			cancelButtonText: "Batalkan",
			type: "warning"
		})) addAlert({
			type: "success",
			title: "Cache Dibersihkan!",
			message: "Operasi konfirmasi lokal berhasil diproses."
		});
		else addAlert({
			type: "info",
			title: "Dibatalkan",
			message: "Tindakan konfirmasi dibatalkan oleh pengguna."
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
					children: /* @__PURE__ */ jsx(BellRing, { className: "w-4 h-4" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-bold text-slate-900 dark:text-white",
					children: "Pusat Pengujian Laravel Notify & Alert Confirm"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-500 dark:text-slate-400",
					children: "Uji langsung interaksi notifikasi server-side Laravel Notify dan dialog konfirmasi."
				})] })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full",
				children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }), /* @__PURE__ */ jsx("span", { children: "Inertia Flash Integrated" })]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5",
			children: [
				/* @__PURE__ */ jsx(Button, {
					variant: "success",
					size: "sm",
					icon: CheckCircle2,
					isLoading: loadingType === "success",
					onClick: () => triggerServerNotify("success"),
					className: "w-full justify-center",
					children: "Notify Success"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "danger",
					size: "sm",
					icon: AlertCircle,
					isLoading: loadingType === "error",
					onClick: () => triggerServerNotify("error"),
					className: "w-full justify-center",
					children: "Notify Error"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "secondary",
					size: "sm",
					icon: AlertTriangle,
					isLoading: loadingType === "warning",
					onClick: () => triggerServerNotify("warning"),
					className: "w-full justify-center !text-amber-700 dark:!text-amber-400 !bg-amber-50 dark:!bg-amber-950/40 hover:!bg-amber-100",
					children: "Notify Warning"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "outline",
					size: "sm",
					icon: Info,
					isLoading: loadingType === "info",
					onClick: () => triggerServerNotify("info"),
					className: "w-full justify-center",
					children: "Notify Info"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "primary",
					size: "sm",
					icon: HelpCircle,
					isLoading: loadingType === "confirm",
					onClick: () => triggerServerNotify("confirm"),
					className: "w-full justify-center",
					children: "Server Confirm"
				}),
				/* @__PURE__ */ jsx(Button, {
					variant: "secondary",
					size: "sm",
					icon: AlertTriangle,
					onClick: triggerClientConfirm,
					className: "w-full justify-center !border-indigo-200 dark:!border-indigo-800",
					children: "Client Confirm"
				})
			]
		})]
	});
}
// resources/js/components/atoms/Badge.jsx
function Badge({ children, variant = "default", size = "md", dot = false, className = "" }) {
	const variants = {
		default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
		primary: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40",
		success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40",
		warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40",
		danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40",
		purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40"
	};
	const dotColors = {
		default: "bg-slate-400",
		primary: "bg-indigo-500",
		success: "bg-emerald-500",
		warning: "bg-amber-500",
		danger: "bg-rose-500",
		purple: "bg-purple-500"
	};
	const sizes = {
		sm: "text-[11px] px-2 py-0.5",
		md: "text-xs px-2.5 py-1"
	};
	return /* @__PURE__ */ jsxs("span", {
		className: `inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`,
		children: [dot && /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${dotColors[variant] || "bg-slate-400"}` }), /* @__PURE__ */ jsx("span", { children })]
	});
}
// resources/js/Pages/Dashboard/Index.jsx
var Index_exports$2 = /* @__PURE__ */ __exportAll({ default: () => DashboardIndex });
function DashboardIndex({ metrics = [], recentUsers = [], chartData = [], counts = {} }) {
	const getRoleBadge = (role) => {
		switch (role) {
			case "admin": return /* @__PURE__ */ jsx(Badge, {
				variant: "purple",
				size: "sm",
				children: "Admin"
			});
			case "manager": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				size: "sm",
				children: "Manager"
			});
			case "editor": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				size: "sm",
				children: "Editor"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "default",
				size: "sm",
				children: "User"
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Panel Dashboard",
		breadcrumbs: ["Ringkasan"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/10",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 max-w-2xl",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-indigo-100 backdrop-blur-md mb-3",
								children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), "Laravel 12 + Inertia React 19 + Zustand Ready"]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "text-2xl sm:text-3xl font-extrabold tracking-tight",
								children: "Selamat Datang di Panel Dashboard"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm sm:text-base text-indigo-100 leading-relaxed",
								children: "Aplikasi telah dikonfigurasi menggunakan React Atomic Design, Zustand State Management, Tailwind CSS Dark Mode, Laravel Notify Alert/Confirm, dan Server-Side Processing (SSR)."
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-6 flex flex-wrap items-center gap-3",
								children: /* @__PURE__ */ jsx(Link, {
									href: "/users",
									children: /* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										icon: Users,
										className: "!bg-white !text-indigo-900 hover:!bg-indigo-50 font-semibold shadow-md",
										children: "Kelola Data Pengguna (SSR)"
									})
								})
							})
						]
					}),
					/* @__PURE__ */ jsx("div", { className: "absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" }),
					/* @__PURE__ */ jsx("div", { className: "absolute right-32 -top-12 w-64 h-64 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ jsx(DashboardMetrics, { metrics }),
			/* @__PURE__ */ jsx(QuickActionPanel, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-6",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
								children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-slate-900 dark:text-white",
								children: "Pertumbuhan Pengguna Terdaftar"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500 dark:text-slate-400",
								children: "Visualisasi pendaftaran 6 bulan terakhir"
							})] })]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full",
							children: "+42% Kenaikan"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "h-48 flex items-end justify-between gap-4 pt-6 px-2",
						children: chartData.map((item, idx) => {
							const maxVal = Math.max(...chartData.map((d) => d.users), 50);
							const heightPct = Math.round(item.users / maxVal * 100);
							return /* @__PURE__ */ jsxs("div", {
								className: "flex-1 flex flex-col items-center gap-2 group",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "relative w-full flex items-end justify-center h-36",
									children: [/* @__PURE__ */ jsx("div", {
										className: "absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-1.5 py-0.5 rounded shadow",
										children: item.users
									}), /* @__PURE__ */ jsx("div", {
										style: { height: `${heightPct}%` },
										className: "w-full max-w-[36px] bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
									})]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-[11px] font-medium text-slate-500 dark:text-slate-400",
									children: item.month
								})]
							}, idx);
						})
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-bold text-slate-900 dark:text-white",
							children: "Pengguna Baru"
						}), /* @__PURE__ */ jsxs(Link, {
							href: "/users",
							className: "text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1",
							children: [/* @__PURE__ */ jsx("span", { children: "Lihat Semua" }), /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-slate-100 dark:divide-slate-800/80",
						children: recentUsers.map((user) => /* @__PURE__ */ jsxs("div", {
							className: "py-3 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2.5 min-w-0",
								children: [/* @__PURE__ */ jsx(Avatar, {
									src: user.avatar,
									name: user.name,
									size: "sm"
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("p", {
										className: "text-xs font-semibold text-slate-900 dark:text-white truncate",
										children: user.name
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[11px] text-slate-400 dark:text-slate-500 truncate",
										children: user.email
									})]
								})]
							}), /* @__PURE__ */ jsx("div", { children: getRoleBadge(user.role) })]
						}, user.id))
					})] }), /* @__PURE__ */ jsx("div", {
						className: "mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center",
						children: /* @__PURE__ */ jsx(Link, {
							href: "/users",
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								className: "w-full text-xs",
								children: "Kelola Database MySQL & SSR →"
							})
						})
					})]
				})]
			})
		]
	});
}
// resources/js/components/atoms/ToggleSwitch.jsx
function ToggleSwitch({ checked = false, onChange, label = "", disabled = false, className = "" }) {
	return /* @__PURE__ */ jsxs("label", {
		className: `inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					className: "sr-only",
					checked,
					disabled,
					onChange: (e) => !disabled && onChange && onChange(e.target.checked)
				}),
				/* @__PURE__ */ jsx("div", { className: `block w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${checked ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}` }),
				/* @__PURE__ */ jsx("div", { className: `absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${checked ? "transform translate-x-5" : ""}` })
			]
		}), label && /* @__PURE__ */ jsx("span", {
			className: "text-sm font-medium text-slate-700 dark:text-slate-300",
			children: label
		})]
	});
}
// resources/js/Pages/Settings/Index.jsx
var Index_exports$1 = /* @__PURE__ */ __exportAll({ default: () => SettingsIndex });
function SettingsIndex() {
	const { theme, setTheme, toggleTheme } = useThemeStore();
	const { addAlert } = useAlertStore();
	const handleSavePreferences = () => {
		addAlert({
			type: "success",
			title: "Pengaturan Disimpan",
			message: "Preferensi tema dan tampilan berhasil disimpan ke penyimpanan lokal."
		});
	};
	return /* @__PURE__ */ jsx(DashboardLayout, {
		title: "Pengaturan Sistem",
		breadcrumbs: ["Pengaturan"],
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-4xl space-y-6",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
							children: /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-base font-bold text-slate-900 dark:text-white",
							children: "Tampilan Antarmuka (Theme Mode)"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: "Pilih antara mode terang (Light mode) dan mode gelap (Dark mode) dengan Zustand state management."
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							onClick: () => setTheme("light"),
							className: `p-4 rounded-xl border-2 cursor-pointer transition-all ${theme === "light" ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300"}`,
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-amber-500" }), /* @__PURE__ */ jsx("span", {
										className: "text-sm font-bold text-slate-900 dark:text-white",
										children: "Mode Terang (Light)"
									})]
								}), theme === "light" && /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-indigo-600" })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "h-16 rounded-lg bg-slate-100 border border-slate-200 p-2 flex flex-col justify-between",
								children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-2 rounded bg-slate-300" }), /* @__PURE__ */ jsxs("div", {
									className: "flex gap-1.5",
									children: [/* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded bg-indigo-500" }), /* @__PURE__ */ jsx("div", { className: "flex-1 h-6 rounded bg-white" })]
								})]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							onClick: () => setTheme("dark"),
							className: `p-4 rounded-xl border-2 cursor-pointer transition-all ${theme === "dark" ? "border-indigo-600 bg-indigo-950/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300"}`,
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Moon, { className: "w-4 h-4 text-indigo-400" }), /* @__PURE__ */ jsx("span", {
										className: "text-sm font-bold text-slate-900 dark:text-white",
										children: "Mode Gelap (Dark)"
									})]
								}), theme === "dark" && /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-indigo-500" })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex flex-col justify-between",
								children: [/* @__PURE__ */ jsx("div", { className: "w-12 h-2 rounded bg-slate-700" }), /* @__PURE__ */ jsxs("div", {
									className: "flex gap-1.5",
									children: [/* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded bg-indigo-600" }), /* @__PURE__ */ jsx("div", { className: "flex-1 h-6 rounded bg-slate-900" })]
								})]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx(ToggleSwitch, {
							checked: theme === "dark",
							onChange: toggleTheme,
							label: "Aktifkan Mode Gelap Sekarang"
						}), /* @__PURE__ */ jsx(Button, {
							variant: "primary",
							size: "sm",
							onClick: handleSavePreferences,
							children: "Simpan Perubahan"
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
				children: [/* @__PURE__ */ jsxs("h3", {
					className: "text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-indigo-500" }), "Spesifikasi Stack Proyek"]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-slate-400 uppercase font-semibold text-[10px]",
								children: "Framework Backend"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-bold text-slate-900 dark:text-white text-sm mt-0.5",
								children: "Laravel 12 + PHP 8.4"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-slate-400 uppercase font-semibold text-[10px]",
								children: "Database Engine"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-bold text-slate-900 dark:text-white text-sm mt-0.5",
								children: "MySQL 8.0"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-slate-400 uppercase font-semibold text-[10px]",
								children: "Frontend UI & Bridge"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-bold text-slate-900 dark:text-white text-sm mt-0.5",
								children: "React 19 JSX + Inertia.js v3"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-slate-400 uppercase font-semibold text-[10px]",
								children: "Styling & State Management"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-bold text-slate-900 dark:text-white text-sm mt-0.5",
								children: "Tailwind CSS v4 + Zustand v5"
							})]
						})
					]
				})]
			})]
		})
	});
}
// resources/js/components/organisms/DataTable.jsx
function DataTable({ users = [], sortBy = "created_at", sortDirection = "desc", onSort, onEdit, onDelete }) {
	const columns = [
		{
			key: "name",
			label: "Pengguna & Email",
			sortable: true
		},
		{
			key: "role",
			label: "Peran (Role)",
			sortable: true
		},
		{
			key: "status",
			label: "Status",
			sortable: true
		},
		{
			key: "phone",
			label: "No. Telepon",
			sortable: false
		},
		{
			key: "created_at",
			label: "Terdaftar Pada",
			sortable: true
		},
		{
			key: "actions",
			label: "Aksi",
			sortable: false,
			align: "right"
		}
	];
	const getRoleBadge = (role) => {
		switch (role) {
			case "admin": return /* @__PURE__ */ jsx(Badge, {
				variant: "purple",
				dot: true,
				children: "Administrator"
			});
			case "manager": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				dot: true,
				children: "Manager"
			});
			case "editor": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				dot: true,
				children: "Editor"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "default",
				dot: true,
				children: "User Biasa"
			});
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "active": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				dot: true,
				children: "Aktif"
			});
			case "inactive": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				dot: true,
				children: "Nonaktif"
			});
			case "suspended": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				dot: true,
				children: "Ditangguhkan"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "default",
				children: status
			});
		}
	};
	const formatDate = (dateStr) => {
		if (!dateStr) return "-";
		try {
			const date = new Date(dateStr);
			return new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric"
			}).format(date);
		} catch (e) {
			return dateStr;
		}
	};
	return /* @__PURE__ */ jsx("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ jsxs("table", {
			className: "w-full text-left border-collapse",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", {
				className: "border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
				children: columns.map((col) => {
					const isSorted = sortBy === col.key;
					return /* @__PURE__ */ jsx("th", {
						className: `py-3.5 px-4 ${col.align === "right" ? "text-right" : "text-left"}`,
						children: col.sortable ? /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => onSort && onSort(col.key),
							className: "inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer",
							children: [/* @__PURE__ */ jsx("span", { children: col.label }), isSorted ? sortDirection === "asc" ? /* @__PURE__ */ jsx(ArrowUp, { className: "w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" }) : /* @__PURE__ */ jsx(ArrowDown, { className: "w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" }) : /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3 h-3 text-slate-400 opacity-60" })]
						}) : /* @__PURE__ */ jsx("span", { children: col.label })
					}, col.key);
				})
			}) }), /* @__PURE__ */ jsx("tbody", {
				className: "divide-y divide-slate-100 dark:divide-slate-800/60 text-xs",
				children: users.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
					colSpan: columns.length,
					className: "py-12 text-center text-slate-400 dark:text-slate-500",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col items-center justify-center gap-2",
						children: [/* @__PURE__ */ jsx(User, { className: "w-8 h-8 opacity-40" }), /* @__PURE__ */ jsx("p", {
							className: "font-medium",
							children: "Tidak ada data pengguna yang sesuai dengan filter."
						})]
					})
				}) }) : users.map((user) => /* @__PURE__ */ jsxs("tr", {
					className: "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
					children: [
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(Avatar, {
									src: user.avatar,
									name: user.name,
									size: "sm"
								}), /* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-slate-900 dark:text-white truncate",
										children: user.name
									}), /* @__PURE__ */ jsx("p", {
										className: "text-slate-500 dark:text-slate-400 text-[11px] truncate",
										children: user.email
									})]
								})]
							})
						}),
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4 whitespace-nowrap",
							children: getRoleBadge(user.role)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4 whitespace-nowrap",
							children: getStatusBadge(user.status)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300",
							children: user.phone || "-"
						}),
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400",
							children: formatDate(user.created_at)
						}),
						/* @__PURE__ */ jsx("td", {
							className: "py-3.5 px-4 whitespace-nowrap text-right",
							children: /* @__PURE__ */ jsxs("div", {
								className: "inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => onEdit && onEdit(user),
									className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors",
									title: "Edit Pengguna",
									children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => onDelete && onDelete(user),
									className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors",
									title: "Hapus Pengguna",
									children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
								})]
							})
						})
					]
				}, user.id))
			})]
		})
	});
}
// resources/js/components/molecules/PaginationControls.jsx
function PaginationControls({ links = [], from = 0, to = 0, total = 0, className = "" }) {
	if (!links || links.length <= 3) {
		if (total === 0) return null;
		return /* @__PURE__ */ jsx("div", {
			className: `flex items-center justify-between py-3 px-4 text-xs text-slate-500 dark:text-slate-400 ${className}`,
			children: /* @__PURE__ */ jsxs("span", { children: [
				"Total ",
				total,
				" data ditemukan"
			] })
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: `flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 ${className}`,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "text-xs text-slate-500 dark:text-slate-400",
			children: [
				"Menampilkan ",
				/* @__PURE__ */ jsx("span", {
					className: "font-semibold text-slate-800 dark:text-slate-200",
					children: from || 0
				}),
				" sampai",
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "font-semibold text-slate-800 dark:text-slate-200",
					children: to || 0
				}),
				" dari",
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "font-semibold text-slate-800 dark:text-slate-200",
					children: total
				}),
				" data"
			]
		}), /* @__PURE__ */ jsx("nav", {
			className: "flex items-center gap-1",
			"aria-label": "Pagination",
			children: links.map((link, idx) => {
				const isPrev = idx === 0;
				const isNext = idx === links.length - 1;
				const isActive = link.active;
				const isDisabled = !link.url;
				let cleanLabel = link.label.replace(/&laquo;/g, "").replace(/&raquo;/g, "").trim();
				if (isPrev) return /* @__PURE__ */ jsxs(Link, {
					href: link.url || "#",
					preserveScroll: true,
					preserveState: true,
					className: `inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDisabled ? "text-slate-300 dark:text-slate-700 pointer-events-none" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
					title: "Halaman Sebelumnya",
					children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4 mr-1" }), /* @__PURE__ */ jsx("span", { children: "Sebelumnya" })]
				}, idx);
				if (isNext) return /* @__PURE__ */ jsxs(Link, {
					href: link.url || "#",
					preserveScroll: true,
					preserveState: true,
					className: `inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isDisabled ? "text-slate-300 dark:text-slate-700 pointer-events-none" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
					title: "Halaman Selanjutnya",
					children: [/* @__PURE__ */ jsx("span", { children: "Selanjutnya" }), /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4 ml-1" })]
				}, idx);
				return /* @__PURE__ */ jsx(Link, {
					href: link.url || "#",
					preserveScroll: true,
					preserveState: true,
					className: `min-w-8 h-8 inline-flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-indigo-600 text-white font-semibold shadow-xs dark:bg-indigo-500" : isDisabled ? "text-slate-400 dark:text-slate-600 pointer-events-none" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
					children: cleanLabel
				}, idx);
			})
		})]
	});
}
// resources/js/components/atoms/Input.jsx
var Input = forwardRef(function Input({ type = "text", error = false, className = "", icon: Icon = null, clearable = false, onClear, ...props }, ref) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative w-full",
		children: [
			Icon && /* @__PURE__ */ jsx("div", {
				className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500",
				children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
			}),
			/* @__PURE__ */ jsx("input", {
				ref,
				type,
				className: `w-full rounded-lg text-sm transition-colors duration-150 border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${Icon ? "pl-9" : "pl-3.5"} ${clearable ? "pr-9" : "pr-3.5"} py-2 ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950"} ${className}`,
				...props
			}),
			clearable && props.value && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onClear,
				className: "absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
				children: /* @__PURE__ */ jsx("svg", {
					className: "w-4 h-4",
					fill: "none",
					stroke: "currentColor",
					viewBox: "0 0 24 24",
					children: /* @__PURE__ */ jsx("path", {
						strokeLinecap: "round",
						strokeLinejoin: "round",
						strokeWidth: "2",
						d: "M6 18L18 6M6 6l12 12"
					})
				})
			})
		]
	});
});
// resources/js/components/molecules/SearchBar.jsx
function SearchBar({ value = "", onChange, onClear, placeholder = "Cari data...", className = "", autoFocus = false }) {
	return /* @__PURE__ */ jsx("div", {
		className: `relative ${className}`,
		children: /* @__PURE__ */ jsx(Input, {
			type: "text",
			value,
			onChange: (e) => onChange(e.target.value),
			onClear,
			clearable: Boolean(value),
			icon: Search,
			placeholder,
			autoFocus
		})
	});
}
// resources/js/components/atoms/Select.jsx
function Select({ options = [], value, onChange, className = "", error = false, placeholder = "Pilih opsi...", ...props }) {
	return /* @__PURE__ */ jsxs("select", {
		value,
		onChange,
		className: `w-full rounded-lg text-sm transition-colors duration-150 border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-2 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 cursor-pointer ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950"} ${className}`,
		...props,
		children: [placeholder && /* @__PURE__ */ jsx("option", {
			value: "",
			disabled: true,
			children: placeholder
		}), options.map((opt) => /* @__PURE__ */ jsx("option", {
			value: opt.value,
			children: opt.label
		}, opt.value))]
	});
}
// resources/js/components/molecules/FilterDropdown.jsx
function FilterDropdown({ role = "all", status = "all", perPage = 10, onRoleChange, onStatusChange, onPerPageChange, className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `flex flex-wrap items-center gap-2.5 ${className}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400",
				children: [/* @__PURE__ */ jsx(Filter, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", {
					className: "hidden sm:inline",
					children: "Filter:"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "w-36",
				children: /* @__PURE__ */ jsx(Select, {
					value: role,
					onChange: (e) => onRoleChange(e.target.value),
					options: [
						{
							value: "all",
							label: "Semua Role"
						},
						{
							value: "admin",
							label: "Administrator"
						},
						{
							value: "manager",
							label: "Manager"
						},
						{
							value: "editor",
							label: "Editor"
						},
						{
							value: "user",
							label: "User Biasa"
						}
					],
					placeholder: ""
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "w-36",
				children: /* @__PURE__ */ jsx(Select, {
					value: status,
					onChange: (e) => onStatusChange(e.target.value),
					options: [
						{
							value: "all",
							label: "Semua Status"
						},
						{
							value: "active",
							label: "Aktif"
						},
						{
							value: "inactive",
							label: "Nonaktif"
						},
						{
							value: "suspended",
							label: "Ditangguhkan"
						}
					],
					placeholder: ""
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "w-28",
				children: /* @__PURE__ */ jsx(Select, {
					value: perPage,
					onChange: (e) => onPerPageChange(Number(e.target.value)),
					options: [
						{
							value: 5,
							label: "5 per hal"
						},
						{
							value: 10,
							label: "10 per hal"
						},
						{
							value: 25,
							label: "25 per hal"
						},
						{
							value: 50,
							label: "50 per hal"
						}
					],
					placeholder: ""
				})
			})
		]
	});
}
// resources/js/components/atoms/Label.jsx
function Label({ children, htmlFor, required = false, className = "" }) {
	return /* @__PURE__ */ jsxs("label", {
		htmlFor,
		className: `block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase mb-1.5 ${className}`,
		children: [children, required && /* @__PURE__ */ jsx("span", {
			className: "text-rose-500 ml-1",
			children: "*"
		})]
	});
}
// resources/js/components/molecules/FormField.jsx
function FormField({ label, htmlFor, error, required = false, children, helpText, className = "" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: `space-y-1 ${className}`,
		children: [
			label && /* @__PURE__ */ jsx(Label, {
				htmlFor,
				required,
				children: label
			}),
			children,
			error && /* @__PURE__ */ jsx("p", {
				className: "text-xs text-rose-500 font-medium mt-1",
				children: error
			}),
			!error && helpText && /* @__PURE__ */ jsx("p", {
				className: "text-xs text-slate-500 dark:text-slate-400 mt-1",
				children: helpText
			})
		]
	});
}
// resources/js/Pages/Users/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => UsersIndex });
function UsersIndex({ users, filters = {}, statistics = {} }) {
	const { confirm, addAlert } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [role, setRole] = useState(filters.role || "all");
	const [status, setStatus] = useState(filters.status || "all");
	const [perPage, setPerPage] = useState(filters.per_page || 10);
	const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
	const [sortDirection, setSortDirection] = useState(filters.sort_direction || "desc");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [formErrors, setFormErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "user",
		status: "active",
		phone: "",
		password: ""
	});
	const isFirstRender = useRef(true);
	const applyFilters = (newOverrides = {}) => {
		const queryParams = {
			search: newOverrides.search !== void 0 ? newOverrides.search : search,
			role: newOverrides.role !== void 0 ? newOverrides.role : role,
			status: newOverrides.status !== void 0 ? newOverrides.status : status,
			per_page: newOverrides.perPage !== void 0 ? newOverrides.perPage : perPage,
			sort_by: newOverrides.sortBy !== void 0 ? newOverrides.sortBy : sortBy,
			sort_direction: newOverrides.sortDirection !== void 0 ? newOverrides.sortDirection : sortDirection
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.role === "all") delete queryParams.role;
		if (queryParams.status === "all") delete queryParams.status;
		if (queryParams.per_page === 10) delete queryParams.per_page;
		if (queryParams.sort_by === "created_at" && queryParams.sort_direction === "desc") {
			delete queryParams.sort_by;
			delete queryParams.sort_direction;
		}
		router.get("/users", queryParams, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			onStart: () => setIsRefreshing(true),
			onFinish: () => setIsRefreshing(false)
		});
	};
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const timer = setTimeout(() => {
			applyFilters({ search });
		}, 400);
		return () => clearTimeout(timer);
	}, [search]);
	const handleRoleChange = (newRole) => {
		setRole(newRole);
		applyFilters({ role: newRole });
	};
	const handleStatusChange = (newStatus) => {
		setStatus(newStatus);
		applyFilters({ status: newStatus });
	};
	const handlePerPageChange = (newPerPage) => {
		setPerPage(newPerPage);
		applyFilters({ perPage: newPerPage });
	};
	const handleSort = (columnKey) => {
		const nextDirection = sortBy === columnKey && sortDirection === "asc" ? "desc" : "asc";
		setSortBy(columnKey);
		setSortDirection(nextDirection);
		applyFilters({
			sortBy: columnKey,
			sortDirection: nextDirection
		});
	};
	const handleResetFilters = () => {
		setSearch("");
		setRole("all");
		setStatus("all");
		setPerPage(10);
		setSortBy("created_at");
		setSortDirection("desc");
		router.get("/users", {}, {
			preserveState: true,
			replace: true
		});
	};
	const openCreateModal = () => {
		setEditingUser(null);
		setFormData({
			name: "",
			email: "",
			role: "user",
			status: "active",
			phone: "",
			password: ""
		});
		setFormErrors({});
		setIsModalOpen(true);
	};
	const openEditModal = (user) => {
		setEditingUser(user);
		setFormData({
			name: user.name,
			email: user.email,
			role: user.role,
			status: user.status,
			phone: user.phone || "",
			password: ""
		});
		setFormErrors({});
		setIsModalOpen(true);
	};
	const handleFormSubmit = (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormErrors({});
		if (editingUser) router.put(`/users/${editingUser.id}`, formData, {
			onSuccess: () => {
				setIsModalOpen(false);
			},
			onError: (errors) => {
				setFormErrors(errors);
			},
			onFinish: () => setIsSubmitting(false)
		});
		else router.post("/users", formData, {
			onSuccess: () => {
				setIsModalOpen(false);
			},
			onError: (errors) => {
				setFormErrors(errors);
			},
			onFinish: () => setIsSubmitting(false)
		});
	};
	const handleDeleteUser = async (user) => {
		if (await confirm({
			title: `Hapus Pengguna: ${user.name}?`,
			message: `Data pengguna dengan email ${user.email} akan dihapus secara permanen dari basis data MySQL.`,
			confirmButtonText: "Ya, Hapus Pengguna",
			cancelButtonText: "Batalkan",
			type: "danger"
		})) router.delete(`/users/${user.id}`, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Manajemen Pengguna (SSR)",
		breadcrumbs: ["Data Pengguna"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-3 rounded-xl bg-indigo-600 text-white shadow-sm",
						children: /* @__PURE__ */ jsx(Database, { className: "w-5 h-5" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-bold text-slate-900 dark:text-white",
							children: "Server Side Rendering & Processing Active"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
							children: "Realtime MySQL"
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-600 dark:text-slate-400 mt-0.5",
						children: "Pencarian, filter per role/status, sorting dinamis, dan pagination diolah langsung di server side melalui Laravel Eloquent."
					})] })]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex items-center gap-2 w-full md:w-auto",
					children: /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						icon: UserPlus,
						onClick: openCreateModal,
						className: "w-full md:w-auto",
						children: "Tambah Pengguna Baru"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "w-full lg:max-w-xs",
							children: /* @__PURE__ */ jsx(SearchBar, {
								value: search,
								onChange: (val) => setSearch(val),
								onClear: () => {
									setSearch("");
									applyFilters({ search: "" });
								},
								placeholder: "Cari nama, email, atau telepon..."
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto",
							children: [/* @__PURE__ */ jsx(FilterDropdown, {
								role,
								status,
								perPage,
								onRoleChange: handleRoleChange,
								onStatusChange: handleStatusChange,
								onPerPageChange: handlePerPageChange
							}), (search || role !== "all" || status !== "all" || perPage !== 10) && /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "sm",
								icon: RefreshCw,
								onClick: handleResetFilters,
								className: "text-slate-500 hover:text-slate-700",
								children: "Reset Filter"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [isRefreshing && /* @__PURE__ */ jsx("div", {
							className: "absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xs z-10 flex items-center justify-center",
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-md",
								children: "Memuat data server..."
							})
						}), /* @__PURE__ */ jsx(DataTable, {
							users: users.data,
							sortBy,
							sortDirection,
							onSort: handleSort,
							onEdit: openEditModal,
							onDelete: handleDeleteUser
						})]
					}),
					/* @__PURE__ */ jsx(PaginationControls, {
						links: users.links,
						from: users.from,
						to: users.to,
						total: users.total
					})
				]
			}),
			isModalOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity",
					onClick: () => setIsModalOpen(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-base font-bold text-slate-900 dark:text-white",
								children: editingUser ? "Edit Data Pengguna" : "Tambah Pengguna Baru"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setIsModalOpen(false),
								className: "p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
								children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleFormSubmit,
							className: "mt-4 space-y-4",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Lengkap",
									error: formErrors.name,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.name,
										onChange: (e) => setFormData({
											...formData,
											name: e.target.value
										}),
										placeholder: "cth. Budi Santoso",
										error: Boolean(formErrors.name),
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Alamat Email",
									error: formErrors.email,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										type: "email",
										value: formData.email,
										onChange: (e) => setFormData({
											...formData,
											email: e.target.value
										}),
										placeholder: "cth. budi@example.com",
										error: Boolean(formErrors.email),
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Peran (Role)",
										error: formErrors.role,
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.role,
											onChange: (e) => setFormData({
												...formData,
												role: e.target.value
											}),
											options: [
												{
													value: "user",
													label: "User Biasa"
												},
												{
													value: "editor",
													label: "Editor"
												},
												{
													value: "manager",
													label: "Manager"
												},
												{
													value: "admin",
													label: "Administrator"
												}
											],
											placeholder: "",
											error: Boolean(formErrors.role)
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Status Akun",
										error: formErrors.status,
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.status,
											onChange: (e) => setFormData({
												...formData,
												status: e.target.value
											}),
											options: [
												{
													value: "active",
													label: "Aktif"
												},
												{
													value: "inactive",
													label: "Nonaktif"
												},
												{
													value: "suspended",
													label: "Ditangguhkan"
												}
											],
											placeholder: "",
											error: Boolean(formErrors.status)
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "No. Telepon",
									error: formErrors.phone,
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.phone,
										onChange: (e) => setFormData({
											...formData,
											phone: e.target.value
										}),
										placeholder: "+62 812-3456-7890",
										error: Boolean(formErrors.phone)
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: editingUser ? "Password (Kosongkan jika tidak diubah)" : "Password",
									error: formErrors.password,
									required: !editingUser,
									children: /* @__PURE__ */ jsx(Input, {
										type: "password",
										value: formData.password,
										onChange: (e) => setFormData({
											...formData,
											password: e.target.value
										}),
										placeholder: "Minimal 6 karakter",
										error: Boolean(formErrors.password),
										required: !editingUser
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										type: "button",
										onClick: () => setIsModalOpen(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										isLoading: isSubmitting,
										children: editingUser ? "Simpan Perubahan" : "Buat Pengguna"
									})]
								})
							]
						})]
					})
				})]
			})
		]
	});
}
// resources/js/ssr.jsx
var appName = "Laravel";
createServer((page) => createInertiaApp({
	page,
	render: ReactDOMServer.renderToString,
	title: (title) => title ? `${title} - ${appName}` : appName,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({
			"./Pages/Analytics/Index.jsx": Index_exports$3,
			"./Pages/Dashboard/Index.jsx": Index_exports$2,
			"./Pages/Settings/Index.jsx": Index_exports$1,
			"./Pages/Users/Index.jsx": Index_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
export {};
