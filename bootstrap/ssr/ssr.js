import React, { forwardRef, useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { AlertCircle, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, BellRing, Briefcase, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Edit3, FileText, Gauge, Hash, HelpCircle, Info, Layers, LayoutDashboard, LogOut, MapPin, Menu, Minus, Moon, Network, Plus, Save, Search, Settings, Shield, ShieldCheck, Sparkles, Sun, Trash2, Truck, UserCheck, UserPlus, Users, X } from "lucide-react";
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
	const menuGroups = [
		{
			title: "Menu Utama",
			items: [{
				name: "Dashboard Operasional",
				href: "/dashboard",
				icon: LayoutDashboard,
				active: url.startsWith("/dashboard") || url === "/"
			}]
		},
		{
			title: "Organisasi & Struktur",
			items: [{
				name: "Organisasi & Site",
				href: "/organization",
				icon: Building2,
				badge: "Site/Dept",
				badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
				active: url.startsWith("/organization")
			}]
		},
		{
			title: "Master Operasional Hauling",
			items: [
				{
					name: "Armada & Unit Hauling",
					href: "/master/units",
					icon: Truck,
					badge: "Fleets",
					badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
					active: url.startsWith("/master/units")
				},
				{
					name: "Driver & SIMPER",
					href: "/master/drivers",
					icon: UserCheck,
					badge: "K3LH",
					badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
					active: url.startsWith("/master/drivers")
				},
				{
					name: "Lokasi & Rute Hauling",
					href: "/master/locations",
					icon: MapPin,
					active: url.startsWith("/master/locations")
				},
				{
					name: "Shift Kerja",
					href: "/master/shifts",
					icon: Clock,
					active: url.startsWith("/master/shifts")
				},
				{
					name: "Material Tambang",
					href: "/master/materials",
					icon: Layers,
					active: url.startsWith("/master/materials")
				}
			]
		},
		{
			title: "Mitra & Klien",
			items: [{
				name: "Vendor & Rental",
				href: "/master/vendors",
				icon: Briefcase,
				active: url.startsWith("/master/vendors")
			}, {
				name: "Klien / Pemilik IUP",
				href: "/master/customers",
				icon: Building2,
				active: url.startsWith("/master/customers")
			}]
		},
		{
			title: "Kepegawaian & Akses",
			items: [
				{
					name: "Data Karyawan",
					href: "/master/employees",
					icon: Users,
					active: url.startsWith("/master/employees")
				},
				{
					name: "Pengguna Sistem",
					href: "/users",
					icon: Users,
					active: url.startsWith("/users")
				},
				{
					name: "Role & Permission",
					href: "/security/roles",
					icon: ShieldCheck,
					active: url.startsWith("/security/roles")
				},
				{
					name: "Log Aktivitas",
					href: "/security/activity-logs",
					icon: FileText,
					active: url.startsWith("/security/activity-logs")
				}
			]
		},
		{
			title: "Pengaturan",
			items: [{
				name: "Konfigurasi Sistem",
				href: "/settings/configuration",
				icon: Settings,
				active: url.startsWith("/settings/configuration")
			}]
		}
	];
	const sidebarContent = /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col h-full justify-between",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "overflow-y-auto flex-1 custom-scrollbar",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "sticky top-0 z-10 bg-white dark:bg-slate-900 flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800",
				children: [/* @__PURE__ */ jsxs(Link, {
					href: "/dashboard",
					className: "flex items-center gap-3 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0",
						children: /* @__PURE__ */ jsx(Truck, { className: "w-5 h-5" })
					}), !isCollapsed && /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none",
							children: "PT TEKNINDO ADHYA PANE"
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[10px] text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase mt-0.5",
							children: "Coal Hauling System"
						})]
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: closeMobile,
					className: "md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
					children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
				})]
			}), /* @__PURE__ */ jsx("nav", {
				className: "p-3 space-y-4",
				children: menuGroups.map((group, groupIdx) => /* @__PURE__ */ jsxs("div", {
					className: "space-y-1",
					children: [!isCollapsed && /* @__PURE__ */ jsx("div", {
						className: "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
						children: group.title
					}), group.items.map((item) => {
						const Icon = item.icon;
						return /* @__PURE__ */ jsxs(Link, {
							href: item.href,
							onClick: closeMobile,
							className: `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${item.active ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}`,
							title: isCollapsed ? item.name : void 0,
							children: [
								/* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 shrink-0 ${item.active ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}` }),
								!isCollapsed && /* @__PURE__ */ jsx("span", {
									className: "flex-1 truncate",
									children: item.name
								}),
								!isCollapsed && item.badge && /* @__PURE__ */ jsx("span", {
									className: `text-[9px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || "bg-slate-100 text-slate-700"}`,
									children: item.badge
								})
							]
						}, item.name);
					})]
				}, groupIdx))
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0 bg-white dark:bg-slate-900",
			children: [!isCollapsed && /* @__PURE__ */ jsxs("div", {
				className: "p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
					children: /* @__PURE__ */ jsx(Shield, { className: "w-3.5 h-3.5" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "text-[11px] leading-tight",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-semibold text-slate-800 dark:text-slate-200",
						children: "Phase 1 Foundation"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-slate-400 text-[9px]",
						children: "Master Data & RBAC"
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
var Index_exports$12 = /* @__PURE__ */ __exportAll({ default: () => AnalyticsIndex });
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
// resources/js/Pages/Customers/Index.jsx
var Index_exports$11 = /* @__PURE__ */ __exportAll({ default: () => CustomersIndex });
function CustomersIndex({ customers, filters = {}, sites = [] }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [siteId, setSiteId] = useState(filters.site_id || "all");
	const [modal, setModal] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		site_id: sites[0]?.id || "",
		customer_code: "",
		name: "",
		contract_number: "",
		contract_start_date: "2025-01-01",
		contract_end_date: "2027-12-31",
		target_tonnage: 1e6,
		contact_person: "",
		phone: "",
		email: "",
		is_active: true
	});
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			site_id: overrides.site_id !== void 0 ? overrides.site_id : siteId
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.site_id === "all") delete queryParams.site_id;
		router.get("/master/customers", queryParams, {
			preserveState: true,
			replace: true
		});
	};
	const openCreate = () => {
		setEditing(null);
		setForm({
			site_id: sites[0]?.id || "",
			customer_code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
			name: "",
			contract_number: `CTR/TAP/${(/* @__PURE__ */ new Date()).getFullYear()}/${Math.floor(10 + Math.random() * 90)}`,
			contract_start_date: "2025-01-01",
			contract_end_date: "2027-12-31",
			target_tonnage: 25e5,
			contact_person: "",
			phone: "",
			email: "",
			is_active: true
		});
		setModal(true);
	};
	const openEdit = (c) => {
		setEditing(c);
		setForm({
			site_id: c.site_id || "",
			customer_code: c.customer_code,
			name: c.name,
			contract_number: c.contract_number || "",
			contract_start_date: c.contract_start_date ? c.contract_start_date.split("T")[0] : "",
			contract_end_date: c.contract_end_date ? c.contract_end_date.split("T")[0] : "",
			target_tonnage: c.target_tonnage,
			contact_person: c.contact_person || "",
			phone: c.phone || "",
			email: c.email || "",
			is_active: c.is_active
		});
		setModal(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) router.put(`/master/customers/${editing.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/master/customers", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (c) => {
		if (await confirm({
			title: `Hapus Klien: ${c.name}?`,
			message: "Tindakan ini akan menghapus data kontrak pemilik konsesi tambang."
		})) router.delete(`/master/customers/${c.id}`);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Klien & Pemilik Konsesi Tambang (IUP)",
		breadcrumbs: ["Master Data", "Klien IUP"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-full sm:max-w-xs",
					children: /* @__PURE__ */ jsx(SearchBar, {
						value: search,
						onChange: (val) => {
							setSearch(val);
							applyFilters({ search: val });
						},
						onClear: () => {
							setSearch("");
							applyFilters({ search: "" });
						},
						placeholder: "Cari Klien, Kontrak, PIC..."
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-40",
						children: /* @__PURE__ */ jsx(Select, {
							value: siteId,
							onChange: (e) => {
								setSiteId(e.target.value);
								applyFilters({ site_id: e.target.value });
							},
							options: [{
								value: "all",
								label: "Semua Site"
							}, ...sites.map((s) => ({
								value: s.id,
								label: s.name
							}))],
							placeholder: ""
						})
					}), /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						icon: Plus,
						onClick: openCreate,
						children: "Tambah Klien IUP"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Nama Perusahaan Klien (IUP)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Nomor Kontrak"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Target Ritase / Tonase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site Proyek"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Periode Kontrak"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: customers.data.map((c) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: c.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: c.customer_code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300",
										children: c.contract_number || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsxs("span", {
											className: "font-extrabold text-amber-600 dark:text-amber-400",
											children: [Number(c.target_tonnage).toLocaleString("id-ID"), " Ton"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: c.site?.name || "-"
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 text-slate-500",
										children: [
											c.contract_start_date ? new Date(c.contract_start_date).toLocaleDateString("id-ID") : "",
											" s/d",
											" ",
											c.contract_end_date ? new Date(c.contract_end_date).toLocaleDateString("id-ID") : ""
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: c.is_active ? "success" : "warning",
											dot: true,
											children: c.is_active ? "Kontrak Aktif" : "Selesai / Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEdit(c),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(c),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, c.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: customers.links,
					from: customers.from,
					to: customers.to,
					total: customers.total
				})]
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editing ? "Edit Klien" : "Tambah Klien IUP Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Kode Klien",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: form.customer_code,
											onChange: (e) => setForm({
												...form,
												customer_code: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Site Penugasan",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.site_id,
											onChange: (e) => setForm({
												...form,
												site_id: e.target.value
											}),
											options: sites.map((s) => ({
												value: s.id,
												label: s.name
											})),
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Perusahaan Pemilik IUP",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										}),
										placeholder: "cth. PT Multi Tambangjaya Utama",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Nomor Kontrak Kerja",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.contract_number,
											onChange: (e) => setForm({
												...form,
												contract_number: e.target.value
											}),
											placeholder: "CTR/TAP/2026/01"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Target Tonase (Ton)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: form.target_tonnage,
											onChange: (e) => setForm({
												...form,
												target_tonnage: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Mulai Kontrak",
										children: /* @__PURE__ */ jsx(Input, {
											type: "date",
											value: form.contract_start_date,
											onChange: (e) => setForm({
												...form,
												contract_start_date: e.target.value
											})
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Selesai Kontrak",
										children: /* @__PURE__ */ jsx(Input, {
											type: "date",
											value: form.contract_end_date,
											onChange: (e) => setForm({
												...form,
												contract_end_date: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "PIC / Narahubung",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.contact_person,
											onChange: (e) => setForm({
												...form,
												contact_person: e.target.value
											})
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Telepon / Email",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.phone,
											onChange: (e) => setForm({
												...form,
												phone: e.target.value
											}),
											placeholder: "+62 812-xxxx"
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Klien"
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
// resources/js/Pages/Dashboard/Index.jsx
var Index_exports$10 = /* @__PURE__ */ __exportAll({ default: () => DashboardIndex });
function DashboardIndex({ metrics = [], recentUnits = [], recentDrivers = [], chartData = [], unitStatusCounts = {}, driverStatusCounts = {} }) {
	const getUnitStatusBadge = (status) => {
		switch (status) {
			case "operating": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				size: "sm",
				dot: true,
				children: "Operating"
			});
			case "standby": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				size: "sm",
				dot: true,
				children: "Standby"
			});
			case "maintenance": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				size: "sm",
				dot: true,
				children: "Maintenance"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				size: "sm",
				dot: true,
				children: "Breakdown"
			});
		}
	};
	const getDriverMcuBadge = (mcu) => {
		switch (mcu) {
			case "fit": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				size: "sm",
				children: "MCU Fit"
			});
			case "fit_with_note": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				size: "sm",
				children: "Fit Bersyarat"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				size: "sm",
				children: "Unfit"
			});
		}
	};
	const modules = [
		{
			name: "Organisasi & Site",
			href: "/organization",
			icon: Building2,
			count: "2 Site, 5 Dept",
			color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950"
		},
		{
			name: "Armada & Unit",
			href: "/master/units",
			icon: Truck,
			count: `${unitStatusCounts.total || 0} Unit Terdaftar`,
			color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
		},
		{
			name: "Driver & SIMPER",
			href: "/master/drivers",
			icon: UserCheck,
			count: `${driverStatusCounts.total || 0} Driver K3LH`,
			color: "text-amber-600 bg-amber-50 dark:bg-amber-950"
		},
		{
			name: "Lokasi & Rute",
			href: "/master/locations",
			icon: MapPin,
			count: "Pit to Jetty KM 0-49",
			color: "text-purple-600 bg-purple-50 dark:bg-purple-950"
		},
		{
			name: "Shift Operasional",
			href: "/master/shifts",
			icon: Clock,
			count: "Shift 1, 2 & Long Shift",
			color: "text-blue-600 bg-blue-50 dark:bg-blue-950"
		},
		{
			name: "Mitra & Vendor",
			href: "/master/vendors",
			icon: Briefcase,
			count: "Spareparts, Fuel, Tyre",
			color: "text-rose-600 bg-rose-50 dark:bg-rose-950"
		}
	];
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Panel Dashboard Operasional",
		breadcrumbs: ["Ringkasan Operasional"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white shadow-xl shadow-amber-600/10",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "relative z-10 max-w-3xl",
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amber-100 backdrop-blur-md mb-3",
								children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), "TAP Integrated Coal Hauling Management System — Phase 1 Foundation"]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "text-2xl sm:text-3xl font-extrabold tracking-tight",
								children: "PT TEKNINDO ADHYA PANE"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm sm:text-base text-amber-100 leading-relaxed",
								children: "Pusat kendali master data operasional pengangkutan batubara terpadu: Organisasi, Armada Unit Hauling, Driver & SIMPER K3LH, Lokasi Pit-to-Port, dan Role-Based Access Control."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-5 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ jsx(Link, {
									href: "/master/units",
									children: /* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										icon: Truck,
										className: "!bg-white !text-slate-900 hover:!bg-amber-50 font-bold shadow-md",
										children: "Kelola Armada Hauling"
									})
								}), /* @__PURE__ */ jsx(Link, {
									href: "/master/drivers",
									children: /* @__PURE__ */ jsx(Button, {
										variant: "outline",
										icon: UserCheck,
										className: "!border-white/40 !text-white hover:!bg-white/10",
										children: "Kesiapan Driver & MCU"
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx("div", { className: "absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" }),
					/* @__PURE__ */ jsx("div", { className: "absolute right-32 -top-12 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3",
				children: modules.map((m, idx) => {
					const Icon = m.icon;
					return /* @__PURE__ */ jsxs(Link, {
						href: m.href,
						className: "p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all group",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: `p-2 rounded-xl w-fit ${m.color} mb-2.5`,
								children: /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" })
							}),
							/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate",
								children: m.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-[10px] text-slate-400 truncate mt-0.5",
								children: m.count
							})
						]
					}, idx);
				})
			}),
			/* @__PURE__ */ jsx(DashboardMetrics, { metrics }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
								children: /* @__PURE__ */ jsx(Truck, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider",
								children: "Physical Availability (PA) Armada"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-slate-400",
								children: "Status kesiapan operasional seluruh armada dump truck"
							})] })]
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-xs font-bold text-emerald-600 dark:text-emerald-400",
							children: [unitStatusCounts.operating || 0, " Operating"]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-4 gap-2 pt-2 text-center text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block",
									children: "OPERATING"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-emerald-600 dark:text-emerald-400",
									children: unitStatusCounts.operating || 0
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block",
									children: "STANDBY"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-indigo-600 dark:text-indigo-400",
									children: unitStatusCounts.standby || 0
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-amber-700 dark:text-amber-300 font-bold block",
									children: "SERVICE"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-amber-600 dark:text-amber-400",
									children: unitStatusCounts.maintenance || 0
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-rose-700 dark:text-rose-300 font-bold block",
									children: "BREAKDOWN"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-rose-600 dark:text-rose-400",
									children: unitStatusCounts.breakdown || 0
								})]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
								children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider",
								children: "Kepatuhan K3LH & Status MCU Driver"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-slate-400",
								children: "Hasil medical check-up dan izin mengemudi SIMPER"
							})] })]
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-xs font-bold text-emerald-600 dark:text-emerald-400",
							children: [driverStatusCounts.fit || 0, " Laik Kerja"]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-3 gap-2.5 pt-2 text-center text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block",
									children: "FIT OPERASI"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-emerald-600 dark:text-emerald-400",
									children: driverStatusCounts.fit || 0
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-amber-700 dark:text-amber-300 font-bold block",
									children: "BERSYARAT"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-amber-600 dark:text-amber-400",
									children: driverStatusCounts.fit_with_note || 0
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[10px] text-rose-700 dark:text-rose-300 font-bold block",
									children: "UNFIT (STOP)"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-lg font-extrabold text-rose-600 dark:text-rose-400",
									children: driverStatusCounts.unfit || 0
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsx(QuickActionPanel, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4 text-indigo-600 dark:text-indigo-400" }), /* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-slate-900 dark:text-white",
								children: "Armada Hauling Terbaru"
							})]
						}), /* @__PURE__ */ jsx(Link, {
							href: "/master/units",
							className: "text-xs text-indigo-600 hover:underline flex items-center gap-1",
							children: "Lihat Semua Unit →"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-slate-100 dark:divide-slate-800 text-xs",
						children: recentUnits.map((unit) => /* @__PURE__ */ jsxs("div", {
							className: "py-2.5 flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("div", {
									className: "w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-indigo-600 dark:text-indigo-400",
									children: unit.unit_code.substring(0, 2)
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "font-bold text-slate-900 dark:text-white font-mono",
									children: unit.unit_code
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[11px] text-slate-400",
									children: [
										unit.brand,
										" ",
										unit.model,
										" (",
										unit.registration_number,
										")"
									]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-right",
								children: [getUnitStatusBadge(unit.status), /* @__PURE__ */ jsxs("p", {
									className: "text-[10px] font-mono text-slate-400 mt-1",
									children: [Number(unit.last_hm).toLocaleString(), " HM"]
								})]
							})]
						}, unit.id))
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(UserCheck, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }), /* @__PURE__ */ jsx("h3", {
								className: "text-sm font-bold text-slate-900 dark:text-white",
								children: "Status Driver & K3LH"
							})]
						}), /* @__PURE__ */ jsx(Link, {
							href: "/master/drivers",
							className: "text-xs text-emerald-600 hover:underline flex items-center gap-1",
							children: "Lihat Semua Driver →"
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "divide-y divide-slate-100 dark:divide-slate-800 text-xs",
						children: recentDrivers.map((driver) => /* @__PURE__ */ jsxs("div", {
							className: "py-2.5 flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx(Avatar, {
									name: driver.employee?.name || "Driver",
									size: "sm"
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "font-bold text-slate-900 dark:text-white",
									children: driver.employee?.name || "-"
								}), /* @__PURE__ */ jsxs("p", {
									className: "text-[11px] font-mono text-amber-600 dark:text-amber-400",
									children: [
										driver.driver_code,
										" | SIM ",
										driver.sim_type
									]
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-right",
								children: [getDriverMcuBadge(driver.mcu_status), /* @__PURE__ */ jsx("p", {
									className: "text-[10px] font-mono text-slate-400 mt-1",
									children: driver.simper_number
								})]
							})]
						}, driver.id))
					})]
				})]
			})
		]
	});
}
// resources/js/Pages/Drivers/Index.jsx
var Index_exports$9 = /* @__PURE__ */ __exportAll({ default: () => DriversIndex });
function DriversIndex({ drivers, filters = {}, availableEmployees = [], statistics = {} }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [mcuStatus, setMcuStatus] = useState(filters.mcu_status || "all");
	const [status, setStatus] = useState(filters.status || "all");
	const [simType, setSimType] = useState(filters.sim_type || "all");
	const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
	const [sortDirection, setSortDirection] = useState(filters.sort_direction || "desc");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingDriver, setEditingDriver] = useState(null);
	const [formData, setFormData] = useState({
		driver_code: "",
		employee_id: "",
		sim_number: "",
		sim_type: "BII Umum",
		sim_expiry: "2028-12-31",
		simper_number: "",
		simper_expiry: "2026-12-31",
		mcu_status: "fit",
		mcu_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		mcu_expiry: "2027-01-01",
		notes: "",
		is_active: true
	});
	const isFirstRender = useRef(true);
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			mcu_status: overrides.mcu_status !== void 0 ? overrides.mcu_status : mcuStatus,
			status: overrides.status !== void 0 ? overrides.status : status,
			sim_type: overrides.sim_type !== void 0 ? overrides.sim_type : simType,
			sort_by: overrides.sortBy !== void 0 ? overrides.sortBy : sortBy,
			sort_direction: overrides.sortDirection !== void 0 ? overrides.sortDirection : sortDirection
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.mcu_status === "all") delete queryParams.mcu_status;
		if (queryParams.status === "all") delete queryParams.status;
		if (queryParams.sim_type === "all") delete queryParams.sim_type;
		router.get("/master/drivers", queryParams, {
			preserveState: true,
			preserveScroll: true,
			replace: true
		});
	};
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const timer = setTimeout(() => applyFilters({ search }), 400);
		return () => clearTimeout(timer);
	}, [search]);
	const openCreateModal = () => {
		setEditingDriver(null);
		setFormData({
			driver_code: `DRV-${Math.floor(100 + Math.random() * 900)}`,
			employee_id: availableEmployees[0]?.id || "",
			sim_number: `SIM-${Math.floor(1e11 + Math.random() * 9e11)}`,
			sim_type: "BII Umum",
			sim_expiry: "2028-12-31",
			simper_number: `SIMPER-TAP-2026-${Math.floor(100 + Math.random() * 900)}`,
			simper_expiry: "2026-12-31",
			mcu_status: "fit",
			mcu_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			mcu_expiry: "2027-01-01",
			notes: "",
			is_active: true
		});
		setIsModalOpen(true);
	};
	const openEditModal = (driver) => {
		setEditingDriver(driver);
		setFormData({
			driver_code: driver.driver_code,
			employee_id: driver.employee_id,
			sim_number: driver.sim_number,
			sim_type: driver.sim_type,
			sim_expiry: driver.sim_expiry ? driver.sim_expiry.split("T")[0] : "",
			simper_number: driver.simper_number,
			simper_expiry: driver.simper_expiry ? driver.simper_expiry.split("T")[0] : "",
			mcu_status: driver.mcu_status,
			mcu_date: driver.mcu_date ? driver.mcu_date.split("T")[0] : "",
			mcu_expiry: driver.mcu_expiry ? driver.mcu_expiry.split("T")[0] : "",
			notes: driver.notes || "",
			is_active: driver.is_active
		});
		setIsModalOpen(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingDriver) router.put(`/master/drivers/${editingDriver.id}`, formData, { onSuccess: () => setIsModalOpen(false) });
		else router.post("/master/drivers", formData, { onSuccess: () => setIsModalOpen(false) });
	};
	const handleDelete = async (driver) => {
		if (await confirm({
			title: `Hapus Driver: ${driver.driver_code}?`,
			message: `Data driver ${driver.employee?.name || ""} akan dihapus dari daftar penugasan.`,
			confirmButtonText: "Ya, Hapus Driver"
		})) router.delete(`/master/drivers/${driver.id}`);
	};
	const getMcuBadge = (mcu) => {
		switch (mcu) {
			case "fit": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				dot: true,
				children: "Fit Operasi"
			});
			case "fit_with_note": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				dot: true,
				children: "Fit Bersyarat"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				dot: true,
				children: "Unfit (Stop)"
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Data Driver & SIMPER (SSR)",
		breadcrumbs: ["Master Data", "Driver"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-slate-400 uppercase",
							children: "Total Driver"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-slate-900 dark:text-white mt-1",
							children: [statistics.total || 0, " Orang"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-emerald-500 uppercase",
							children: "MCU Fit (Siap Jalan)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1",
							children: [statistics.fit || 0, " Driver"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-amber-500 uppercase",
							children: "Fit Bersyarat"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-amber-600 dark:text-amber-400 mt-1",
							children: [statistics.fit_with_note || 0, " Driver"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-rose-500 uppercase",
							children: "Unfit (Dilarang Bawa Unit)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-rose-600 dark:text-rose-400 mt-1",
							children: [statistics.unfit || 0, " Driver"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-full sm:max-w-xs",
						children: /* @__PURE__ */ jsx(SearchBar, {
							value: search,
							onChange: (val) => setSearch(val),
							onClear: () => {
								setSearch("");
								applyFilters({ search: "" });
							},
							placeholder: "Cari Driver ID, Nama, No SIMPER..."
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-40",
								children: /* @__PURE__ */ jsx(Select, {
									value: mcuStatus,
									onChange: (e) => {
										setMcuStatus(e.target.value);
										applyFilters({ mcu_status: e.target.value });
									},
									options: [
										{
											value: "all",
											label: "Semua Status MCU"
										},
										{
											value: "fit",
											label: "Fit"
										},
										{
											value: "fit_with_note",
											label: "Fit Bersyarat"
										},
										{
											value: "unfit",
											label: "Unfit"
										}
									],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "w-36",
								children: /* @__PURE__ */ jsx(Select, {
									value: simType,
									onChange: (e) => {
										setSimType(e.target.value);
										applyFilters({ sim_type: e.target.value });
									},
									options: [
										{
											value: "all",
											label: "Semua Gol. SIM"
										},
										{
											value: "BII Umum",
											label: "SIM BII Umum"
										},
										{
											value: "BI",
											label: "SIM BI"
										},
										{
											value: "A",
											label: "SIM A"
										}
									],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "primary",
								icon: UserPlus,
								onClick: openCreateModal,
								children: "Daftarkan Driver"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Driver ID & Nama Driver"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Gol. SIM & No. SIM"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Nomor SIMPER Site"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Masa Berlaku SIMPER"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status MCU"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status Aktif"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: drivers.data.map((driver) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: driver.employee?.name || "-"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold",
											children: driver.driver_code
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-slate-800 dark:text-slate-200",
											children: driver.sim_type
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-400 font-mono",
											children: driver.sim_number
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400",
										children: driver.simper_number
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: driver.simper_expiry ? new Date(driver.simper_expiry).toLocaleDateString("id-ID") : "-"
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [getMcuBadge(driver.mcu_status), driver.notes && /* @__PURE__ */ jsx("p", {
											className: "text-[10px] text-slate-400 mt-0.5",
											children: driver.notes
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: driver.is_active ? "success" : "danger",
											children: driver.is_active ? "Siap Operasi" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditModal(driver),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(driver),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, driver.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: drivers.links,
					from: drivers.from,
					to: drivers.to,
					total: drivers.total
				})]
			}),
			isModalOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setIsModalOpen(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingDriver ? "Edit Driver" : "Registrasi Driver Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setIsModalOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Driver ID (Unik)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.driver_code,
											onChange: (e) => setFormData({
												...formData,
												driver_code: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Pilih Karyawan",
										required: true,
										children: editingDriver ? /* @__PURE__ */ jsx(Input, {
											value: editingDriver.employee?.name || "",
											disabled: true
										}) : /* @__PURE__ */ jsx(Select, {
											value: formData.employee_id,
											onChange: (e) => setFormData({
												...formData,
												employee_id: e.target.value
											}),
											options: availableEmployees.map((e) => ({
												value: e.id,
												label: `${e.name} (${e.employee_code})`
											})),
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Golongan SIM",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.sim_type,
											onChange: (e) => setFormData({
												...formData,
												sim_type: e.target.value
											}),
											options: [
												{
													value: "BII Umum",
													label: "BII Umum (Dump Truck)"
												},
												{
													value: "BI",
													label: "BI"
												},
												{
													value: "A",
													label: "A (Light Vehicle)"
												}
											],
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Nomor SIM Kepolisian",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.sim_number,
											onChange: (e) => setFormData({
												...formData,
												sim_number: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Nomor SIMPER (Perusahaan)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.simper_number,
											onChange: (e) => setFormData({
												...formData,
												simper_number: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Masa Berlaku SIMPER",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											type: "date",
											value: formData.simper_expiry,
											onChange: (e) => setFormData({
												...formData,
												simper_expiry: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Hasil MCU (Medical Check Up)",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.mcu_status,
											onChange: (e) => setFormData({
												...formData,
												mcu_status: e.target.value
											}),
											options: [
												{
													value: "fit",
													label: "Fit (Laik Operasi)"
												},
												{
													value: "fit_with_note",
													label: "Fit Bersyarat"
												},
												{
													value: "unfit",
													label: "Unfit (Dilarang Operasi)"
												}
											],
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Masa Berlaku MCU",
										children: /* @__PURE__ */ jsx(Input, {
											type: "date",
											value: formData.mcu_expiry,
											onChange: (e) => setFormData({
												...formData,
												mcu_expiry: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Catatan Medis / Syarat HSE",
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.notes,
										onChange: (e) => setFormData({
											...formData,
											notes: e.target.value
										}),
										placeholder: "cth. Wajib kacamata silinder"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setIsModalOpen(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Driver"
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
// resources/js/Pages/Employees/Index.jsx
var Index_exports$8 = /* @__PURE__ */ __exportAll({ default: () => EmployeesIndex });
function EmployeesIndex({ employees, filters = {}, companies = [], sites = [], departments = [], positions = [] }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [departmentId, setDepartmentId] = useState(filters.department_id || "all");
	const [siteId, setSiteId] = useState(filters.site_id || "all");
	const [status, setStatus] = useState(filters.status || "all");
	const [employmentStatus, setEmploymentStatus] = useState(filters.employment_status || "all");
	const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
	const [sortDirection, setSortDirection] = useState(filters.sort_direction || "desc");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState(null);
	const [formData, setFormData] = useState({
		employee_code: "",
		nik: "",
		name: "",
		company_id: companies[0]?.id || "",
		site_id: sites[0]?.id || "",
		department_id: departments[0]?.id || "",
		position_id: positions[0]?.id || "",
		join_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		employment_status: "contract",
		phone: "",
		email: "",
		address: "",
		emergency_contact_name: "",
		emergency_contact_phone: "",
		document_notes: "",
		is_active: true
	});
	const isFirstRender = useRef(true);
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			department_id: overrides.department_id !== void 0 ? overrides.department_id : departmentId,
			site_id: overrides.site_id !== void 0 ? overrides.site_id : siteId,
			status: overrides.status !== void 0 ? overrides.status : status,
			employment_status: overrides.employment_status !== void 0 ? overrides.employment_status : employmentStatus,
			sort_by: overrides.sortBy !== void 0 ? overrides.sortBy : sortBy,
			sort_direction: overrides.sortDirection !== void 0 ? overrides.sortDirection : sortDirection
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.department_id === "all") delete queryParams.department_id;
		if (queryParams.site_id === "all") delete queryParams.site_id;
		if (queryParams.status === "all") delete queryParams.status;
		if (queryParams.employment_status === "all") delete queryParams.employment_status;
		router.get("/master/employees", queryParams, {
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
		const timer = setTimeout(() => applyFilters({ search }), 400);
		return () => clearTimeout(timer);
	}, [search]);
	const openCreateModal = () => {
		setEditingEmployee(null);
		setFormData({
			employee_code: `TAP-EMP-${Math.floor(100 + Math.random() * 900)}`,
			nik: `64720${Date.now().toString().slice(-11)}`,
			name: "",
			company_id: companies[0]?.id || "",
			site_id: sites[0]?.id || "",
			department_id: departments[0]?.id || "",
			position_id: positions[0]?.id || "",
			join_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			employment_status: "contract",
			phone: "",
			email: "",
			address: "",
			emergency_contact_name: "",
			emergency_contact_phone: "",
			document_notes: "",
			is_active: true
		});
		setIsModalOpen(true);
	};
	const openEditModal = (emp) => {
		setEditingEmployee(emp);
		setFormData({
			employee_code: emp.employee_code,
			nik: emp.nik,
			name: emp.name,
			company_id: emp.company_id,
			site_id: emp.site_id,
			department_id: emp.department_id,
			position_id: emp.position_id,
			join_date: emp.join_date ? emp.join_date.split("T")[0] : "",
			employment_status: emp.employment_status,
			phone: emp.phone || "",
			email: emp.email || "",
			address: emp.address || "",
			emergency_contact_name: emp.emergency_contact_name || "",
			emergency_contact_phone: emp.emergency_contact_phone || "",
			document_notes: emp.document_notes || "",
			is_active: emp.is_active
		});
		setIsModalOpen(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingEmployee) router.put(`/master/employees/${editingEmployee.id}`, formData, { onSuccess: () => setIsModalOpen(false) });
		else router.post("/master/employees", formData, { onSuccess: () => setIsModalOpen(false) });
	};
	const handleDelete = async (emp) => {
		if (await confirm({
			title: `Hapus Karyawan: ${emp.name}?`,
			message: `Karyawan dengan ID ${emp.employee_code} akan dinonaktifkan dan masuk ke histori.`,
			confirmButtonText: "Ya, Hapus Data"
		})) router.delete(`/master/employees/${emp.id}`);
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "permanent": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Tetap"
			});
			case "contract": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				children: "Kontrak"
			});
			case "pkwt": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "PKWT"
			});
			case "probation": return /* @__PURE__ */ jsx(Badge, {
				variant: "purple",
				children: "Probation"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Resigned"
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Data Karyawan (SSR)",
		breadcrumbs: ["Master Data", "Karyawan"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
							children: /* @__PURE__ */ jsx(Users, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-bold text-slate-900 dark:text-white",
							children: "Direktori Tenaga Kerja TAP"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-500",
							children: [
								"Total ",
								employees.total,
								" karyawan terdaftar di seluruh site proyek."
							]
						})] })]
					}), /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						icon: UserPlus,
						onClick: openCreateModal,
						children: "Tambah Karyawan Baru"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "lg:col-span-2",
							children: /* @__PURE__ */ jsx(SearchBar, {
								value: search,
								onChange: (val) => setSearch(val),
								onClear: () => {
									setSearch("");
									applyFilters({ search: "" });
								},
								placeholder: "Cari NIK, Nama, atau Employee ID..."
							})
						}),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Select, {
							value: departmentId,
							onChange: (e) => {
								setDepartmentId(e.target.value);
								applyFilters({ department_id: e.target.value });
							},
							options: [{
								value: "all",
								label: "Semua Departemen"
							}, ...departments.map((d) => ({
								value: d.id,
								label: d.name
							}))],
							placeholder: ""
						}) }),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Select, {
							value: siteId,
							onChange: (e) => {
								setSiteId(e.target.value);
								applyFilters({ site_id: e.target.value });
							},
							options: [{
								value: "all",
								label: "Semua Site"
							}, ...sites.map((s) => ({
								value: s.id,
								label: s.name
							}))],
							placeholder: ""
						}) }),
						/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Select, {
							value: employmentStatus,
							onChange: (e) => {
								setEmploymentStatus(e.target.value);
								applyFilters({ employment_status: e.target.value });
							},
							options: [
								{
									value: "all",
									label: "Status Kontrak (Semua)"
								},
								{
									value: "permanent",
									label: "Tetap"
								},
								{
									value: "contract",
									label: "Kontrak"
								},
								{
									value: "pkwt",
									label: "PKWT"
								},
								{
									value: "probation",
									label: "Probation"
								}
							],
							placeholder: ""
						}) })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Employee ID & Nama"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "NIK"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Departemen & Jabatan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Penugasan Site"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tgl Gabung"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status Kerja"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: employees.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: 7,
								className: "py-12 text-center text-slate-400",
								children: "Tidak ada data karyawan yang sesuai dengan kriteria filter."
							}) }) : employees.data.map((emp) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: emp.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: emp.employee_code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300",
										children: emp.nik
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold text-slate-800 dark:text-slate-200",
											children: emp.position?.title || "-"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-400",
											children: emp.department?.name || "-"
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: emp.site?.name || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-500",
										children: emp.join_date ? new Date(emp.join_date).toLocaleDateString("id-ID") : "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: getStatusBadge(emp.employment_status)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditModal(emp),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												title: "Edit Karyawan",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(emp),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												title: "Hapus Karyawan",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, emp.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: employees.links,
					from: employees.from,
					to: employees.to,
					total: employees.total
				})]
			}),
			isModalOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setIsModalOpen(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingEmployee ? "Edit Data Karyawan" : "Form Karyawan Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setIsModalOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-4 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Employee ID",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.employee_code,
											onChange: (e) => setFormData({
												...formData,
												employee_code: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "NIK (Nomor Induk Kependudukan)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.nik,
											onChange: (e) => setFormData({
												...formData,
												nik: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Lengkap Karyawan",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.name,
										onChange: (e) => setFormData({
											...formData,
											name: e.target.value
										}),
										placeholder: "cth. Supriyadi",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsx(FormField, {
											label: "Site Penempatan",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.site_id,
												onChange: (e) => setFormData({
													...formData,
													site_id: e.target.value
												}),
												options: sites.map((s) => ({
													value: s.id,
													label: s.name
												})),
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Departemen",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.department_id,
												onChange: (e) => setFormData({
													...formData,
													department_id: e.target.value
												}),
												options: departments.map((d) => ({
													value: d.id,
													label: d.name
												})),
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Jabatan",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.position_id,
												onChange: (e) => setFormData({
													...formData,
													position_id: e.target.value
												}),
												options: positions.map((p) => ({
													value: p.id,
													label: p.title
												})),
												placeholder: ""
											})
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsx(FormField, {
											label: "Tanggal Bergabung",
											required: true,
											children: /* @__PURE__ */ jsx(Input, {
												type: "date",
												value: formData.join_date,
												onChange: (e) => setFormData({
													...formData,
													join_date: e.target.value
												}),
												required: true
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Status Kepegawaian",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.employment_status,
												onChange: (e) => setFormData({
													...formData,
													employment_status: e.target.value
												}),
												options: [
													{
														value: "permanent",
														label: "Karyawan Tetap"
													},
													{
														value: "contract",
														label: "Kontrak PKWT"
													},
													{
														value: "probation",
														label: "Masa Percobaan"
													},
													{
														value: "resigned",
														label: "Berhenti / Resigned"
													}
												],
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Nomor Telepon / WhatsApp",
											children: /* @__PURE__ */ jsx(Input, {
												value: formData.phone,
												onChange: (e) => setFormData({
													...formData,
													phone: e.target.value
												}),
												placeholder: "+62 812-xxxx-xxxx"
											})
										})
									]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Alamat Domisili / Mess Site",
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.address,
										onChange: (e) => setFormData({
											...formData,
											address: e.target.value
										}),
										placeholder: "Alamat lengkap atau nama mess karyawan"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Kontak Darurat (Nama)",
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.emergency_contact_name,
											onChange: (e) => setFormData({
												...formData,
												emergency_contact_name: e.target.value
											}),
											placeholder: "Nama keluarga / wali"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "No. Telepon Darurat",
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.emergency_contact_phone,
											onChange: (e) => setFormData({
												...formData,
												emergency_contact_phone: e.target.value
											}),
											placeholder: "+62 8xx-xxxx"
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Catatan Dokumen / Sertifikat (KTP, BPJS, Ijazah)",
									children: /* @__PURE__ */ jsx(Input, {
										value: formData.document_notes,
										onChange: (e) => setFormData({
											...formData,
											document_notes: e.target.value
										}),
										placeholder: "KTP terlampir, BPJS Ketenagakerjaan aktif"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setIsModalOpen(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Karyawan"
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
// resources/js/Pages/Locations/Index.jsx
var Index_exports$7 = /* @__PURE__ */ __exportAll({ default: () => LocationsIndex });
function LocationsIndex({ locations, filters = {}, sites = [] }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [locationType, setLocationType] = useState(filters.location_type || "all");
	const [siteId, setSiteId] = useState(filters.site_id || "all");
	const [modal, setModal] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		site_id: sites[0]?.id || "",
		code: "",
		name: "",
		location_type: "hauling_road",
		km_marker: "",
		latitude: "",
		longitude: "",
		is_active: true
	});
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			location_type: overrides.location_type !== void 0 ? overrides.location_type : locationType,
			site_id: overrides.site_id !== void 0 ? overrides.site_id : siteId
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.location_type === "all") delete queryParams.location_type;
		if (queryParams.site_id === "all") delete queryParams.site_id;
		router.get("/master/locations", queryParams, {
			preserveState: true,
			replace: true
		});
	};
	const openCreate = () => {
		setEditing(null);
		setForm({
			site_id: sites[0]?.id || "",
			code: `LOC-${Math.floor(100 + Math.random() * 900)}`,
			name: "",
			location_type: "hauling_road",
			km_marker: "KM 00+000",
			latitude: "",
			longitude: "",
			is_active: true
		});
		setModal(true);
	};
	const openEdit = (loc) => {
		setEditing(loc);
		setForm({
			site_id: loc.site_id,
			code: loc.code,
			name: loc.name,
			location_type: loc.location_type,
			km_marker: loc.km_marker || "",
			latitude: loc.latitude || "",
			longitude: loc.longitude || "",
			is_active: loc.is_active
		});
		setModal(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) router.put(`/master/locations/${editing.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/master/locations", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (loc) => {
		if (await confirm({
			title: `Hapus Lokasi: ${loc.name}?`,
			message: "Tindakan ini akan menghapus data titik lokasi dan rute hauling."
		})) router.delete(`/master/locations/${loc.id}`);
	};
	const getTypeLabel = (t) => {
		return {
			pit: "Pit Tambang",
			front_loading: "Front Loading",
			hauling_road: "Jalur Hauling",
			stockpile: "Stockpile ROM",
			jetty: "Jetty Port",
			disposal: "Disposal Area",
			workshop: "Central Workshop",
			warehouse: "Warehouse Gudang",
			fuel_station: "Fuel Station"
		}[t] || t;
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Data Lokasi & Jalur Hauling (SSR)",
		breadcrumbs: ["Master Data", "Lokasi"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-full sm:max-w-xs",
					children: /* @__PURE__ */ jsx(SearchBar, {
						value: search,
						onChange: (val) => {
							setSearch(val);
							applyFilters({ search: val });
						},
						onClear: () => {
							setSearch("");
							applyFilters({ search: "" });
						},
						placeholder: "Cari nama lokasi atau KM..."
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2.5",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-44",
							children: /* @__PURE__ */ jsx(Select, {
								value: locationType,
								onChange: (e) => {
									setLocationType(e.target.value);
									applyFilters({ location_type: e.target.value });
								},
								options: [
									{
										value: "all",
										label: "Semua Jenis Lokasi"
									},
									{
										value: "pit",
										label: "Pit"
									},
									{
										value: "front_loading",
										label: "Front Loading"
									},
									{
										value: "hauling_road",
										label: "Jalur Hauling"
									},
									{
										value: "stockpile",
										label: "Stockpile"
									},
									{
										value: "jetty",
										label: "Jetty"
									},
									{
										value: "disposal",
										label: "Disposal"
									},
									{
										value: "workshop",
										label: "Workshop"
									},
									{
										value: "warehouse",
										label: "Warehouse"
									},
									{
										value: "fuel_station",
										label: "Fuel Station"
									}
								],
								placeholder: ""
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-36",
							children: /* @__PURE__ */ jsx(Select, {
								value: siteId,
								onChange: (e) => {
									setSiteId(e.target.value);
									applyFilters({ site_id: e.target.value });
								},
								options: [{
									value: "all",
									label: "Semua Site"
								}, ...sites.map((s) => ({
									value: s.id,
									label: s.name
								}))],
								placeholder: ""
							})
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "primary",
							icon: Plus,
							onClick: openCreate,
							children: "Tambah Lokasi"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Nama Titik Lokasi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jenis Lokasi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Marker / KM Jalan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site Terkait"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: locations.data.map((loc) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: loc.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: loc.code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300",
										children: getTypeLabel(loc.location_type)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400",
										children: loc.km_marker || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: loc.site?.name || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: loc.is_active ? "success" : "warning",
											dot: true,
											children: loc.is_active ? "Aktif Digunakan" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEdit(loc),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(loc),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, loc.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: locations.links,
					from: locations.from,
					to: locations.to,
					total: locations.total
				})]
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editing ? "Edit Lokasi" : "Tambah Lokasi Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Site Penempatan",
									required: true,
									children: /* @__PURE__ */ jsx(Select, {
										value: form.site_id,
										onChange: (e) => setForm({
											...form,
											site_id: e.target.value
										}),
										options: sites.map((s) => ({
											value: s.id,
											label: s.name
										})),
										placeholder: ""
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Lokasi",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.code,
										onChange: (e) => setForm({
											...form,
											code: e.target.value
										}),
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Lokasi",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										}),
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Jenis Titik",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: form.location_type,
											onChange: (e) => setForm({
												...form,
												location_type: e.target.value
											}),
											options: [
												{
													value: "pit",
													label: "Pit Tambang"
												},
												{
													value: "front_loading",
													label: "Front Loading"
												},
												{
													value: "hauling_road",
													label: "Jalur Hauling"
												},
												{
													value: "stockpile",
													label: "Stockpile"
												},
												{
													value: "jetty",
													label: "Jetty"
												},
												{
													value: "disposal",
													label: "Disposal"
												},
												{
													value: "workshop",
													label: "Workshop"
												},
												{
													value: "warehouse",
													label: "Warehouse"
												},
												{
													value: "fuel_station",
													label: "Fuel Station"
												}
											],
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "KM Marker",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.km_marker,
											onChange: (e) => setForm({
												...form,
												km_marker: e.target.value
											}),
											placeholder: "KM 15+200"
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Lokasi"
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
// resources/js/Pages/Materials/Index.jsx
var Index_exports$6 = /* @__PURE__ */ __exportAll({ default: () => MaterialsIndex });
function MaterialsIndex({ materials }) {
	const { confirm } = useAlertStore();
	const [modal, setModal] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		code: "",
		name: "",
		unit_of_measure: "Ton",
		density: 1.3,
		is_active: true
	});
	const openCreate = () => {
		setEditing(null);
		setForm({
			code: `MAT-${Math.floor(100 + Math.random() * 900)}`,
			name: "",
			unit_of_measure: "Ton",
			density: 1.3,
			is_active: true
		});
		setModal(true);
	};
	const openEdit = (m) => {
		setEditing(m);
		setForm({
			code: m.code,
			name: m.name,
			unit_of_measure: m.unit_of_measure,
			density: m.density,
			is_active: m.is_active
		});
		setModal(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) router.put(`/master/materials/${editing.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/master/materials", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (m) => {
		if (await confirm({
			title: `Hapus Material: ${m.name}?`,
			message: "Tindakan ini akan menghapus jenis material dari konfigurasi."
		})) router.delete(`/master/materials/${m.id}`);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Data Jenis Material Tambang (SSR)",
		breadcrumbs: ["Master Data", "Material"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between pb-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-500",
					children: "Konfigurasi jenis muatan hauling, satuan ukur (Ton/BCM/Liter), dan densitas material."
				}), /* @__PURE__ */ jsx(Button, {
					variant: "primary",
					icon: Plus,
					onClick: openCreate,
					children: "Tambah Material"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Nama Material"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Satuan Pengukuran (UoM)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Faktor Densitas (Ton/M3)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: materials.data.map((m) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: m.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: m.code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx("span", {
											className: "font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
											children: m.unit_of_measure
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400",
										children: m.density
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: m.is_active ? "success" : "warning",
											dot: true,
											children: m.is_active ? "Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEdit(m),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(m),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, m.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: materials.links,
					from: materials.from,
					to: materials.to,
					total: materials.total
				})]
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editing ? "Edit Material" : "Tambah Jenis Material"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Material",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.code,
										onChange: (e) => setForm({
											...form,
											code: e.target.value
										}),
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Material",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										}),
										placeholder: "cth. Coal ROM",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Satuan (UoM)",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: form.unit_of_measure,
											onChange: (e) => setForm({
												...form,
												unit_of_measure: e.target.value
											}),
											options: [
												{
													value: "Ton",
													label: "Ton (Metrik)"
												},
												{
													value: "BCM",
													label: "BCM (Bank Cubic Meter)"
												},
												{
													value: "M3",
													label: "M3 (Meter Kubik)"
												},
												{
													value: "Liter",
													label: "Liter (Bahan Bakar)"
												}
											],
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Densitas (Ton/M3)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											step: "0.001",
											value: form.density,
											onChange: (e) => setForm({
												...form,
												density: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Material"
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
// resources/js/Pages/Organization/Index.jsx
var Index_exports$5 = /* @__PURE__ */ __exportAll({ default: () => OrganizationIndex });
function OrganizationIndex({ tab = "sites", companies = [], sites, departments, positions, filters = {} }) {
	const { confirm } = useAlertStore();
	const [currentTab, setCurrentTab] = useState(tab);
	const [search, setSearch] = useState(filters.search || "");
	const [modalSite, setModalSite] = useState(false);
	const [editingSite, setEditingSite] = useState(null);
	const [siteForm, setSiteForm] = useState({
		company_id: "1",
		code: "",
		name: "",
		location: "",
		latitude: "",
		longitude: "",
		is_active: true
	});
	const [modalDept, setModalDept] = useState(false);
	const [editingDept, setEditingDept] = useState(null);
	const [deptForm, setDeptForm] = useState({
		company_id: "1",
		code: "",
		name: "",
		description: "",
		is_active: true
	});
	const [modalPos, setModalPos] = useState(false);
	const [editingPos, setEditingPos] = useState(null);
	const [posForm, setPosForm] = useState({
		department_id: "1",
		parent_id: "",
		code: "",
		title: "",
		level: 2,
		is_active: true
	});
	const handleTabChange = (newTab) => {
		setCurrentTab(newTab);
		router.get("/organization", {
			tab: newTab,
			search: ""
		}, {
			preserveState: true,
			replace: true
		});
	};
	const handleSearch = (val) => {
		setSearch(val);
		router.get("/organization", {
			tab: currentTab,
			search: val
		}, {
			preserveState: true,
			replace: true
		});
	};
	const openCreateSite = () => {
		setEditingSite(null);
		setSiteForm({
			company_id: companies[0]?.id || "1",
			code: "",
			name: "",
			location: "",
			latitude: "",
			longitude: "",
			is_active: true
		});
		setModalSite(true);
	};
	const openEditSite = (site) => {
		setEditingSite(site);
		setSiteForm({
			company_id: site.company_id,
			code: site.code,
			name: site.name,
			location: site.location || "",
			latitude: site.latitude || "",
			longitude: site.longitude || "",
			is_active: site.is_active
		});
		setModalSite(true);
	};
	const submitSite = (e) => {
		e.preventDefault();
		if (editingSite) router.put(`/organization/sites/${editingSite.id}`, siteForm, { onSuccess: () => setModalSite(false) });
		else router.post("/organization/sites", siteForm, { onSuccess: () => setModalSite(false) });
	};
	const deleteSite = async (site) => {
		if (await confirm({
			title: `Hapus Site: ${site.name}?`,
			message: "Tindakan ini tidak dapat dibatalkan jika site tidak memiliki unit atau karyawan terkait.",
			confirmButtonText: "Ya, Hapus Site"
		})) router.delete(`/organization/sites/${site.id}`);
	};
	const openCreateDept = () => {
		setEditingDept(null);
		setDeptForm({
			company_id: companies[0]?.id || "1",
			code: "",
			name: "",
			description: "",
			is_active: true
		});
		setModalDept(true);
	};
	const openEditDept = (dept) => {
		setEditingDept(dept);
		setDeptForm({
			company_id: dept.company_id || "1",
			code: dept.code,
			name: dept.name,
			description: dept.description || "",
			is_active: dept.is_active
		});
		setModalDept(true);
	};
	const submitDept = (e) => {
		e.preventDefault();
		if (editingDept) router.put(`/organization/departments/${editingDept.id}`, deptForm, { onSuccess: () => setModalDept(false) });
		else router.post("/organization/departments", deptForm, { onSuccess: () => setModalDept(false) });
	};
	const deleteDept = async (dept) => {
		if (await confirm({
			title: `Hapus Departemen: ${dept.name}?`,
			message: "Pastikan departemen tidak memiliki posisi atau karyawan."
		})) router.delete(`/organization/departments/${dept.id}`);
	};
	const openCreatePos = () => {
		setEditingPos(null);
		setPosForm({
			department_id: departments?.data[0]?.id || "1",
			parent_id: "",
			code: "",
			title: "",
			level: 2,
			is_active: true
		});
		setModalPos(true);
	};
	const openEditPos = (pos) => {
		setEditingPos(pos);
		setPosForm({
			department_id: pos.department_id,
			parent_id: pos.parent_id || "",
			code: pos.code,
			title: pos.title,
			level: pos.level,
			is_active: pos.is_active
		});
		setModalPos(true);
	};
	const submitPos = (e) => {
		e.preventDefault();
		if (editingPos) router.put(`/organization/positions/${editingPos.id}`, posForm, { onSuccess: () => setModalPos(false) });
		else router.post("/organization/positions", posForm, { onSuccess: () => setModalPos(false) });
	};
	const deletePos = async (pos) => {
		if (await confirm({
			title: `Hapus Jabatan: ${pos.title}?`,
			message: "Pastikan jabatan tidak memiliki bawahan struktural atau karyawan aktif."
		})) router.delete(`/organization/positions/${pos.id}`);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Manajemen Organisasi & Site",
		breadcrumbs: ["Organisasi"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => handleTabChange("sites"),
							className: `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${currentTab === "sites" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
							children: [/* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }), /* @__PURE__ */ jsxs("span", { children: [
								"Site / Proyek (",
								sites?.total || 0,
								")"
							] })]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => handleTabChange("departments"),
							className: `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${currentTab === "departments" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
							children: [/* @__PURE__ */ jsx(Network, { className: "w-4 h-4" }), /* @__PURE__ */ jsxs("span", { children: [
								"Departemen (",
								departments?.total || 0,
								")"
							] })]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => handleTabChange("positions"),
							className: `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${currentTab === "positions" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
							children: [/* @__PURE__ */ jsx(Briefcase, { className: "w-4 h-4" }), /* @__PURE__ */ jsxs("span", { children: [
								"Jabatan & Hirarki (",
								positions?.total || 0,
								")"
							] })]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => handleTabChange("company"),
							className: `px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${currentTab === "company" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
							children: [/* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Profil Entitas TAP" })]
						})
					]
				}), currentTab !== "company" && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "w-64",
							children: /* @__PURE__ */ jsx(SearchBar, {
								value: search,
								onChange: handleSearch,
								onClear: () => handleSearch(""),
								placeholder: "Cari nama atau kode..."
							})
						}),
						currentTab === "sites" && /* @__PURE__ */ jsx(Button, {
							variant: "primary",
							size: "sm",
							icon: Plus,
							onClick: openCreateSite,
							children: "Tambah Site"
						}),
						currentTab === "departments" && /* @__PURE__ */ jsx(Button, {
							variant: "primary",
							size: "sm",
							icon: Plus,
							onClick: openCreateDept,
							children: "Tambah Departemen"
						}),
						currentTab === "positions" && /* @__PURE__ */ jsx(Button, {
							variant: "primary",
							size: "sm",
							icon: Plus,
							onClick: openCreatePos,
							children: "Tambah Jabatan"
						})
					]
				})]
			}),
			currentTab === "sites" && /* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Nama Site"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Lokasi Administratif"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Armada Terdaftar"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Karyawan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: sites.data.map((site) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: site.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: site.code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-600 dark:text-slate-300",
										children: site.location || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "primary",
											children: [site.units_count || 0, " Unit"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "default",
											children: [site.employees_count || 0, " Orang"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: site.is_active ? "success" : "warning",
											dot: true,
											children: site.is_active ? "Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditSite(site),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => deleteSite(site),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, site.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: sites.links,
					from: sites.from,
					to: sites.to,
					total: sites.total
				})]
			}),
			currentTab === "departments" && /* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Departemen"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tanggung Jawab / Deskripsi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jumlah Jabatan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jumlah Karyawan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: departments.data.map((dept) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: dept.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: dept.code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate",
										children: dept.description || "-"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "purple",
											children: [dept.positions_count || 0, " Jabatan"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "default",
											children: [dept.employees_count || 0, " Orang"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: dept.is_active ? "success" : "warning",
											dot: true,
											children: dept.is_active ? "Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditDept(dept),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => deleteDept(dept),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, dept.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: departments.links,
					from: departments.from,
					to: departments.to,
					total: departments.total
				})]
			}),
			currentTab === "positions" && /* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jabatan (Title)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Departemen"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Level & Atasan Langsung"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jumlah Karyawan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: positions.data.map((pos) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: pos.title
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: pos.code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-600 dark:text-slate-300",
										children: pos.department?.name || "-"
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "font-semibold text-indigo-600 dark:text-indigo-400",
											children: ["Level ", pos.level]
										}), pos.parent && /* @__PURE__ */ jsxs("span", {
											className: "text-slate-400 text-[11px] block",
											children: ["Lapor ke: ", pos.parent.title]
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "default",
											children: [pos.employees_count || 0, " Karyawan"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: pos.is_active ? "success" : "warning",
											dot: true,
											children: pos.is_active ? "Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditPos(pos),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => deletePos(pos),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, pos.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: positions.links,
					from: positions.from,
					to: positions.to,
					total: positions.total
				})]
			}),
			currentTab === "company" && companies[0] && /* @__PURE__ */ jsxs("div", {
				className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-4xl space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md",
						children: /* @__PURE__ */ jsx(Building2, { className: "w-8 h-8" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "text-xl font-bold text-slate-900 dark:text-white",
						children: companies[0].name
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider",
						children: [
							"Kode: ",
							companies[0].code,
							" | Entitas Induk Kontraktor Hauling"
						]
					})] })]
				}), /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 font-semibold uppercase text-[10px]",
								children: "Alamat Kantor Pusat / Operasional"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-semibold text-slate-800 dark:text-slate-200 mt-1",
								children: companies[0].address
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 font-semibold uppercase text-[10px]",
								children: "Nomor Pokok Wajib Pajak (NPWP)"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono",
								children: companies[0].npwp
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 font-semibold uppercase text-[10px]",
								children: "Kontak Telepon"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-semibold text-slate-800 dark:text-slate-200 mt-1",
								children: companies[0].phone
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 font-semibold uppercase text-[10px]",
								children: "Alamat Email Resmi"
							}), /* @__PURE__ */ jsx("p", {
								className: "font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono",
								children: companies[0].email
							})]
						})
					]
				})]
			}),
			modalSite && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModalSite(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingSite ? "Edit Site Proyek" : "Tambah Site Proyek"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModalSite(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: submitSite,
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Site (Unik)",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: siteForm.code,
										onChange: (e) => setSiteForm({
											...siteForm,
											code: e.target.value
										}),
										placeholder: "cth. SITE-MTW",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Site / Proyek",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: siteForm.name,
										onChange: (e) => setSiteForm({
											...siteForm,
											name: e.target.value
										}),
										placeholder: "cth. Site Muara Teweh",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Lokasi Geografis",
									children: /* @__PURE__ */ jsx(Input, {
										value: siteForm.location,
										onChange: (e) => setSiteForm({
											...siteForm,
											location: e.target.value
										}),
										placeholder: "Kabupaten Barito Utara, Kalteng"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Latitude",
										children: /* @__PURE__ */ jsx(Input, {
											value: siteForm.latitude,
											onChange: (e) => setSiteForm({
												...siteForm,
												latitude: e.target.value
											}),
											placeholder: "-0.96324"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Longitude",
										children: /* @__PURE__ */ jsx(Input, {
											value: siteForm.longitude,
											onChange: (e) => setSiteForm({
												...siteForm,
												longitude: e.target.value
											}),
											placeholder: "114.88765"
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModalSite(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Site"
									})]
								})
							]
						})]
					})
				})]
			}),
			modalDept && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModalDept(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingDept ? "Edit Departemen" : "Tambah Departemen"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModalDept(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: submitDept,
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Departemen",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: deptForm.code,
										onChange: (e) => setDeptForm({
											...deptForm,
											code: e.target.value
										}),
										placeholder: "cth. OPS",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Departemen",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: deptForm.name,
										onChange: (e) => setDeptForm({
											...deptForm,
											name: e.target.value
										}),
										placeholder: "cth. Operations & Hauling",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Deskripsi / Tugas Utama",
									children: /* @__PURE__ */ jsx(Input, {
										value: deptForm.description,
										onChange: (e) => setDeptForm({
											...deptForm,
											description: e.target.value
										}),
										placeholder: "Manajemen rute hauling dan ritase"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModalDept(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Departemen"
									})]
								})
							]
						})]
					})
				})]
			}),
			modalPos && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModalPos(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingPos ? "Edit Jabatan" : "Tambah Jabatan Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModalPos(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: submitPos,
							className: "mt-4 space-y-3",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Departemen",
									required: true,
									children: /* @__PURE__ */ jsx(Select, {
										value: posForm.department_id,
										onChange: (e) => setPosForm({
											...posForm,
											department_id: e.target.value
										}),
										options: departments.data.map((d) => ({
											value: d.id,
											label: d.name
										})),
										placeholder: ""
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Jabatan",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: posForm.code,
										onChange: (e) => setPosForm({
											...posForm,
											code: e.target.value
										}),
										placeholder: "POS-SPV-HAUL",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Jabatan",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: posForm.title,
										onChange: (e) => setPosForm({
											...posForm,
											title: e.target.value
										}),
										placeholder: "Supervisor Hauling",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Level Hirarki",
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											value: posForm.level,
											onChange: (e) => setPosForm({
												...posForm,
												level: e.target.value
											}),
											min: "1",
											max: "10"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Atasan Langsung",
										children: /* @__PURE__ */ jsx(Select, {
											value: posForm.parent_id,
											onChange: (e) => setPosForm({
												...posForm,
												parent_id: e.target.value
											}),
											options: [{
												value: "",
												label: "Tidak Ada (Top Level)"
											}, ...positions.data.map((p) => ({
												value: p.id,
												label: p.title
											}))],
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModalPos(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Jabatan"
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
// resources/js/Pages/Security/ActivityLogs.jsx
var ActivityLogs_exports = /* @__PURE__ */ __exportAll({ default: () => ActivityLogsIndex });
function ActivityLogsIndex({ logs, filters = {}, modules = [] }) {
	const [search, setSearch] = useState(filters.search || "");
	const [module, setModule] = useState(filters.module || "all");
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			module: overrides.module !== void 0 ? overrides.module : module
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.module === "all") delete queryParams.module;
		router.get("/security/activity-logs", queryParams, {
			preserveState: true,
			replace: true
		});
	};
	const getActionBadge = (action) => {
		switch (action) {
			case "create": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "CREATE"
			});
			case "update": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				children: "UPDATE"
			});
			case "delete": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "DELETE"
			});
			case "config": return /* @__PURE__ */ jsx(Badge, {
				variant: "purple",
				children: "CONFIG"
			});
			case "login": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "LOGIN"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "default",
				children: action.toUpperCase()
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Audit Trail & Log Aktivitas Pengguna (SSR)",
		breadcrumbs: ["Keamanan", "Log Aktivitas"],
		children: [/* @__PURE__ */ jsxs("div", {
			className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "w-full sm:max-w-xs",
				children: /* @__PURE__ */ jsx(SearchBar, {
					value: search,
					onChange: (val) => {
						setSearch(val);
						applyFilters({ search: val });
					},
					onClear: () => {
						setSearch("");
						applyFilters({ search: "" });
					},
					placeholder: "Cari deskripsi, aksi, atau IP..."
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "w-48",
				children: /* @__PURE__ */ jsx(Select, {
					value: module,
					onChange: (e) => {
						setModule(e.target.value);
						applyFilters({ module: e.target.value });
					},
					options: [{
						value: "all",
						label: "Semua Modul"
					}, ...modules.map((m) => ({
						value: m,
						label: m.toUpperCase()
					}))],
					placeholder: ""
				})
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Waktu Kejadian"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Pengguna (User)"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Jenis Aksi"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Modul Target"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Deskripsi Aktivitas"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Alamat IP & Sesi"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800/60",
						children: logs.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 6,
							className: "py-12 text-center text-slate-400",
							children: "Tidak ada catatan aktivitas."
						}) }) : logs.data.map((log) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono",
									children: new Date(log.created_at).toLocaleString("id-ID")
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4 font-semibold text-slate-900 dark:text-white",
									children: log.user?.name || "Sistem Otomatis"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4",
									children: getActionBadge(log.action)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4 font-mono uppercase text-indigo-600 dark:text-indigo-400 font-semibold",
									children: log.module
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-md",
									children: log.description
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3.5 px-4 font-mono text-[11px] text-slate-400",
									children: log.ip_address || "127.0.0.1"
								})
							]
						}, log.id))
					})]
				})
			}), /* @__PURE__ */ jsx(PaginationControls, {
				links: logs.links,
				from: logs.from,
				to: logs.to,
				total: logs.total
			})]
		})]
	});
}
// resources/js/Pages/Security/Roles.jsx
var Roles_exports = /* @__PURE__ */ __exportAll({ default: () => RolesIndex });
function RolesIndex({ roles = [], permissionsGrouped = {} }) {
	const { confirm } = useAlertStore();
	const [modal, setModal] = useState(false);
	const [editingRole, setEditingRole] = useState(null);
	const [form, setForm] = useState({
		name: "",
		label: "",
		description: "",
		permissions: []
	});
	const openCreate = () => {
		setEditingRole(null);
		setForm({
			name: "",
			label: "",
			description: "",
			permissions: []
		});
		setModal(true);
	};
	const openEdit = (role) => {
		setEditingRole(role);
		setForm({
			name: role.name,
			label: role.label,
			description: role.description || "",
			permissions: role.permissions ? role.permissions.map((p) => p.id) : []
		});
		setModal(true);
	};
	const togglePermission = (permId) => {
		setForm((prev) => {
			const has = prev.permissions.includes(permId);
			return {
				...prev,
				permissions: has ? prev.permissions.filter((id) => id !== permId) : [...prev.permissions, permId]
			};
		});
	};
	const toggleAllInGroup = (groupPerms) => {
		const groupIds = groupPerms.map((p) => p.id);
		const allSelected = groupIds.every((id) => form.permissions.includes(id));
		setForm((prev) => ({
			...prev,
			permissions: allSelected ? prev.permissions.filter((id) => !groupIds.includes(id)) : Array.from(/* @__PURE__ */ new Set([...prev.permissions, ...groupIds]))
		}));
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingRole) router.put(`/security/roles/${editingRole.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/security/roles", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (role) => {
		if (await confirm({
			title: `Hapus Role: ${role.label}?`,
			message: "Tindakan ini akan menghapus role hak akses ini dari sistem."
		})) router.delete(`/security/roles/${role.id}`);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Manajemen Role & Hak Akses (RBAC)",
		breadcrumbs: ["Keamanan", "Role & Permission"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-bold text-slate-900 dark:text-white",
					children: "Role-Based Access Control (RBAC)"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-500",
					children: "Konfigurasi hak akses berbasis peran untuk mengontrol fungsionalitas backend dan tampilan frontend."
				})] }), /* @__PURE__ */ jsx(Button, {
					variant: "primary",
					icon: Plus,
					onClick: openCreate,
					children: "Tambah Role Baru"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
				children: roles.map((role) => /* @__PURE__ */ jsxs("div", {
					className: "p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ jsx("div", {
								className: "p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
								children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: role.label
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold",
								children: role.name
							})] })]
						}), /* @__PURE__ */ jsxs(Badge, {
							variant: "default",
							children: [role.users_count || 0, " Pengguna"]
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed",
						children: role.description || "Tidak ada deskripsi khusus."
					})] }), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
						className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-medium text-slate-500",
							children: role.permissions ? `${role.permissions.length} Izin Aktif` : "0 Izin"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "outline",
								size: "sm",
								icon: Edit3,
								onClick: () => openEdit(role),
								children: "Atur Izin"
							}), role.name !== "super_admin" && /* @__PURE__ */ jsx("button", {
								onClick: () => handleDelete(role),
								className: "p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
								title: "Hapus Role",
								children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
							})]
						})]
					}) })]
				}, role.id))
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingRole ? `Konfigurasi Hak Akses: ${editingRole.label}` : "Tambah Role Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-4 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Identifier Role (Unik, Huruf Kecil & Underscore)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: form.name,
											onChange: (e) => setForm({
												...form,
												name: e.target.value
											}),
											placeholder: "cth. dispatcher_lead",
											disabled: Boolean(editingRole),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Nama Label Tampilan",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: form.label,
											onChange: (e) => setForm({
												...form,
												label: e.target.value
											}),
											placeholder: "cth. Dispatcher Lead",
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Deskripsi Tanggung Jawab",
									children: /* @__PURE__ */ jsx(Input, {
										value: form.description,
										onChange: (e) => setForm({
											...form,
											description: e.target.value
										}),
										placeholder: "Tanggung jawab dan cakupan peran..."
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-2",
									children: [/* @__PURE__ */ jsx("h4", {
										className: "font-bold text-slate-900 dark:text-white mb-2",
										children: "Daftar Hak Akses (Permissions Matrix)"
									}), /* @__PURE__ */ jsx("div", {
										className: "max-h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700",
										children: Object.entries(permissionsGrouped).map(([group, perms]) => /* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5 pb-2 border-b border-slate-200/50 dark:border-slate-700/50 last:border-b-0",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ jsxs("span", {
													className: "font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400",
													children: ["Modul: ", group]
												}), /* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => toggleAllInGroup(perms),
													className: "text-[10px] text-slate-500 hover:underline",
													children: "Pilih / Batal Semua"
												})]
											}), /* @__PURE__ */ jsx("div", {
												className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5",
												children: perms.map((p) => {
													const isChecked = form.permissions.includes(p.id);
													return /* @__PURE__ */ jsxs("label", {
														className: `flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${isChecked ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`,
														children: [/* @__PURE__ */ jsx("input", {
															type: "checkbox",
															className: "rounded text-indigo-600",
															checked: isChecked,
															onChange: () => togglePermission(p.id)
														}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
															className: "font-semibold text-slate-800 dark:text-slate-200",
															children: p.label
														}), /* @__PURE__ */ jsx("p", {
															className: "text-[10px] font-mono text-slate-400",
															children: p.name
														})] })]
													}, p.id);
												})
											})]
										}, group))
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Konfigurasi Role"
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
// resources/js/Pages/Settings/Configuration.jsx
var Configuration_exports = /* @__PURE__ */ __exportAll({ default: () => SystemConfiguration });
function SystemConfiguration({ settingsGrouped = {}, sites = [] }) {
	const [settingsState, setSettingsState] = useState(() => {
		const flat = {};
		Object.values(settingsGrouped).forEach((group) => {
			group.forEach((item) => {
				flat[item.key] = item.value;
			});
		});
		return flat;
	});
	const [isSaving, setIsSaving] = useState(false);
	const handleChange = (key, value) => {
		setSettingsState((prev) => ({
			...prev,
			[key]: value
		}));
	};
	const handleSave = (e) => {
		e.preventDefault();
		setIsSaving(true);
		router.post("/settings/configuration", { settings: settingsState }, {
			preserveScroll: true,
			onFinish: () => setIsSaving(false)
		});
	};
	return /* @__PURE__ */ jsx(DashboardLayout, {
		title: "Konfigurasi Operasional & Penomoran Otomatis",
		breadcrumbs: ["Pengaturan", "Konfigurasi Sistem"],
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: handleSave,
			className: "space-y-6 max-w-4xl",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
							children: /* @__PURE__ */ jsx(Gauge, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-slate-900 dark:text-white",
							children: "Parameter Target & Kecepatan Operasional"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500",
							children: "Standar keamanan jalan hauling (K3LH) dan target ritase harian."
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs",
						children: [
							/* @__PURE__ */ jsx(FormField, {
								label: "Target Produksi Hauling Harian (Ton)",
								helpText: "Total tonase batubara yang ditargetkan per 24 jam.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: settingsState["app.hauling.daily_target_ton"] || "15000",
									onChange: (e) => handleChange("app.hauling.daily_target_ton", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Durasi Jam Operasional Harian",
								helpText: "Jam kerja operasional site per hari.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: settingsState["app.hauling.operational_hours"] || "24",
									onChange: (e) => handleChange("app.hauling.operational_hours", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Batas Kecepatan Muatan Penuh (KM/Jam)",
								helpText: "Kecepatan maksimal saat DT bermuatan batubara.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: settingsState["app.safety.speed_limit_loaded"] || "40",
									onChange: (e) => handleChange("app.safety.speed_limit_loaded", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Batas Kecepatan Kosongan (KM/Jam)",
								helpText: "Kecepatan maksimal saat DT kembali ke front kosongan.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									value: settingsState["app.safety.speed_limit_empty"] || "50",
									onChange: (e) => handleChange("app.safety.speed_limit_empty", e.target.value)
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
							children: /* @__PURE__ */ jsx(Hash, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-slate-900 dark:text-white",
							children: "Format Penomoran Dokumen Otomatis"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500",
							children: "Gunakan placeholder: {YEAR}, {MONTH}, {SEQ}."
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs",
						children: [
							/* @__PURE__ */ jsx(FormField, {
								label: "Format Nomor Tiket Timbangan / Hauling",
								helpText: "Contoh hasil: TKT/HAUL/202611/0001",
								children: /* @__PURE__ */ jsx(Input, {
									value: settingsState["app.doc_sequence.ticket"] || "TKT/HAUL/{YEAR}{MONTH}/{SEQ}",
									onChange: (e) => handleChange("app.doc_sequence.ticket", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Format Surat Perintah Kerja (SPK)",
								helpText: "Contoh hasil: SPK/TAP/2026/11/001",
								children: /* @__PURE__ */ jsx(Input, {
									value: settingsState["app.doc_sequence.spk"] || "SPK/TAP/{YEAR}/{MONTH}/{SEQ}",
									onChange: (e) => handleChange("app.doc_sequence.spk", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Format Surat MCU Driver",
								helpText: "Contoh hasil: MCU/TAP/2026/001",
								children: /* @__PURE__ */ jsx(Input, {
									value: settingsState["app.doc_sequence.mcu"] || "MCU/TAP/{YEAR}/{SEQ}",
									onChange: (e) => handleChange("app.doc_sequence.mcu", e.target.value)
								})
							}),
							/* @__PURE__ */ jsx(FormField, {
								label: "Rasio Densitas Solar HSD (Ton / M3)",
								helpText: "Faktor konversi liter ke metrik ton bahan bakar.",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									step: "0.001",
									value: settingsState["app.unit.fuel_density_ratio"] || "0.840",
									onChange: (e) => handleChange("app.unit.fuel_density_ratio", e.target.value)
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
							children: /* @__PURE__ */ jsx(MapPin, { className: "w-5 h-5" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-bold text-sm text-slate-900 dark:text-white",
							children: "Site Proyek Standar"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500",
							children: "Site rujukan awal saat pertama kali pengguna masuk."
						})] })]
					}), /* @__PURE__ */ jsx("div", {
						className: "max-w-md text-xs",
						children: /* @__PURE__ */ jsx(FormField, {
							label: "Pilih Site Default",
							children: /* @__PURE__ */ jsx(Select, {
								value: settingsState["app.site.default"] || "SITE-MTW",
								onChange: (e) => handleChange("app.site.default", e.target.value),
								options: sites.map((s) => ({
									value: s.code,
									label: `${s.name} (${s.code})`
								})),
								placeholder: ""
							})
						})
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex justify-end pt-2",
					children: /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						type: "submit",
						icon: Save,
						isLoading: isSaving,
						children: "Simpan Semua Konfigurasi"
					})
				})
			]
		})
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
var Index_exports$4 = /* @__PURE__ */ __exportAll({ default: () => SettingsIndex });
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
// resources/js/Pages/Shifts/Index.jsx
var Index_exports$3 = /* @__PURE__ */ __exportAll({ default: () => ShiftsIndex });
function ShiftsIndex({ shifts, sites = [] }) {
	const { confirm } = useAlertStore();
	const [modal, setModal] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		site_id: sites[0]?.id || "",
		code: "",
		name: "",
		start_time: "06:00",
		end_time: "18:00",
		is_night_shift: false,
		is_active: true
	});
	const openCreate = () => {
		setEditing(null);
		setForm({
			site_id: sites[0]?.id || "",
			code: `SHIFT-${Math.floor(10 + Math.random() * 90)}`,
			name: "",
			start_time: "06:00",
			end_time: "18:00",
			is_night_shift: false,
			is_active: true
		});
		setModal(true);
	};
	const openEdit = (shift) => {
		setEditing(shift);
		setForm({
			site_id: shift.site_id || "",
			code: shift.code,
			name: shift.name,
			start_time: shift.start_time,
			end_time: shift.end_time,
			is_night_shift: shift.is_night_shift,
			is_active: shift.is_active
		});
		setModal(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) router.put(`/master/shifts/${editing.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/master/shifts", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (shift) => {
		if (await confirm({
			title: `Hapus Shift: ${shift.name}?`,
			message: "Tindakan ini akan menghapus jadwal shift operasional."
		})) router.delete(`/master/shifts/${shift.id}`);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Manajemen Shift Kerja (SSR)",
		breadcrumbs: ["Master Data", "Shift Kerja"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between pb-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-500",
					children: "Konfigurasi rotasi waktu operasional hauling batubara."
				}), /* @__PURE__ */ jsx(Button, {
					variant: "primary",
					icon: Plus,
					onClick: openCreate,
					children: "Tambah Shift"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Nama Shift"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Waktu Operasional"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kategori Shift"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: shifts.data.map((shift) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: shift.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: shift.code
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200",
										children: [
											shift.start_time,
											" - ",
											shift.end_time
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: shift.is_night_shift ? /* @__PURE__ */ jsxs("span", {
											className: "inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold",
											children: [/* @__PURE__ */ jsx(Moon, { className: "w-3 h-3 text-indigo-500" }), /* @__PURE__ */ jsx("span", { children: "Shift Malam" })]
										}) : /* @__PURE__ */ jsxs("span", {
											className: "inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold",
											children: [/* @__PURE__ */ jsx(Sun, { className: "w-3 h-3 text-amber-500" }), /* @__PURE__ */ jsx("span", { children: "Shift Siang" })]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: shift.site?.name || "Seluruh Site"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: shift.is_active ? "success" : "warning",
											dot: true,
											children: shift.is_active ? "Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEdit(shift),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(shift),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, shift.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: shifts.links,
					from: shifts.from,
					to: shifts.to,
					total: shifts.total
				})]
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editing ? "Edit Shift" : "Tambah Shift Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsx(FormField, {
									label: "Kode Shift",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.code,
										onChange: (e) => setForm({
											...form,
											code: e.target.value
										}),
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Shift",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										}),
										placeholder: "cth. Shift 1 (Siang)",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Jam Mulai",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											type: "time",
											value: form.start_time,
											onChange: (e) => setForm({
												...form,
												start_time: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Jam Selesai",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											type: "time",
											value: form.end_time,
											onChange: (e) => setForm({
												...form,
												end_time: e.target.value
											}),
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "py-2",
									children: /* @__PURE__ */ jsx(ToggleSwitch, {
										checked: form.is_night_shift,
										onChange: (val) => setForm({
											...form,
											is_night_shift: val
										}),
										label: "Merupakan Shift Malam (Night Shift)"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Shift"
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
// resources/js/Pages/Units/Index.jsx
var Index_exports$2 = /* @__PURE__ */ __exportAll({ default: () => UnitsIndex });
function UnitsIndex({ units, filters = {}, sites = [], vendors = [], statistics = {} }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [unitType, setUnitType] = useState(filters.unit_type || "all");
	const [status, setStatus] = useState(filters.status || "all");
	const [siteId, setSiteId] = useState(filters.site_id || "all");
	const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
	const [sortDirection, setSortDirection] = useState(filters.sort_direction || "desc");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUnit, setEditingUnit] = useState(null);
	const [formData, setFormData] = useState({
		unit_code: "",
		registration_number: "",
		unit_type: "dump_truck_10",
		brand: "Hino",
		model: "500 FM 260 JD",
		year: 2024,
		capacity_ton: 30,
		capacity_m3: 22,
		chassis_number: "",
		engine_number: "",
		last_hm: 0,
		last_km: 0,
		status: "operating",
		operation_start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		site_id: sites[0]?.id || "",
		vendor_id: "",
		is_active: true
	});
	const isFirstRender = useRef(true);
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			unit_type: overrides.unit_type !== void 0 ? overrides.unit_type : unitType,
			status: overrides.status !== void 0 ? overrides.status : status,
			site_id: overrides.site_id !== void 0 ? overrides.site_id : siteId,
			sort_by: overrides.sortBy !== void 0 ? overrides.sortBy : sortBy,
			sort_direction: overrides.sortDirection !== void 0 ? overrides.sortDirection : sortDirection
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.unit_type === "all") delete queryParams.unit_type;
		if (queryParams.status === "all") delete queryParams.status;
		if (queryParams.site_id === "all") delete queryParams.site_id;
		router.get("/master/units", queryParams, {
			preserveState: true,
			preserveScroll: true,
			replace: true
		});
	};
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const timer = setTimeout(() => applyFilters({ search }), 400);
		return () => clearTimeout(timer);
	}, [search]);
	const openCreateModal = () => {
		setEditingUnit(null);
		setFormData({
			unit_code: `DT-${Math.floor(100 + Math.random() * 900)}`,
			registration_number: `KT ${Math.floor(1e3 + Math.random() * 9e3)} MT`,
			unit_type: "dump_truck_10",
			brand: "Hino",
			model: "500 FM 260 JD",
			year: 2024,
			capacity_ton: 30,
			capacity_m3: 22,
			chassis_number: `MHK${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
			engine_number: `ENG${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
			last_hm: 1200,
			last_km: 25e3,
			status: "operating",
			operation_start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			site_id: sites[0]?.id || "",
			vendor_id: "",
			is_active: true
		});
		setIsModalOpen(true);
	};
	const openEditModal = (unit) => {
		setEditingUnit(unit);
		setFormData({
			unit_code: unit.unit_code,
			registration_number: unit.registration_number,
			unit_type: unit.unit_type,
			brand: unit.brand,
			model: unit.model || "",
			year: unit.year || 2023,
			capacity_ton: unit.capacity_ton,
			capacity_m3: unit.capacity_m3,
			chassis_number: unit.chassis_number || "",
			engine_number: unit.engine_number || "",
			last_hm: unit.last_hm,
			last_km: unit.last_km,
			status: unit.status,
			operation_start_date: unit.operation_start_date ? unit.operation_start_date.split("T")[0] : "",
			site_id: unit.site_id,
			vendor_id: unit.vendor_id || "",
			is_active: unit.is_active
		});
		setIsModalOpen(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingUnit) router.put(`/master/units/${editingUnit.id}`, formData, { onSuccess: () => setIsModalOpen(false) });
		else router.post("/master/units", formData, { onSuccess: () => setIsModalOpen(false) });
	};
	const handleDelete = async (unit) => {
		if (await confirm({
			title: `Hapus Unit: ${unit.unit_code}?`,
			message: `Data unit nomor lambung ${unit.unit_code} (${unit.registration_number}) akan dipindahkan ke arsip.`,
			confirmButtonText: "Ya, Hapus Unit"
		})) router.delete(`/master/units/${unit.id}`);
	};
	const getUnitTypeLabel = (type) => {
		switch (type) {
			case "dump_truck_10": return "Dump Truck 10 Roda";
			case "dump_truck_12": return "Dump Truck 12 Roda";
			case "light_vehicle": return "Light Vehicle (LV)";
			case "fuel_truck": return "Fuel Truck (Tanker)";
			case "service_truck": return "Service Truck";
			case "support_equipment": return "Support Equipment";
			default: return type;
		}
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "operating": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				dot: true,
				children: "Operating (Jalan)"
			});
			case "standby": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				dot: true,
				children: "Standby (Siap)"
			});
			case "maintenance": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				dot: true,
				children: "Maintenance"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				dot: true,
				children: "Breakdown (Rusak)"
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Data Armada & Unit Hauling (SSR)",
		breadcrumbs: ["Master Data", "Armada Unit"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-slate-400 uppercase",
							children: "Total Armada"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-slate-900 dark:text-white mt-1",
							children: [statistics.total || 0, " Unit"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-emerald-500 uppercase",
							children: "Operating (Beroperasi)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1",
							children: [statistics.operating || 0, " Unit"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-amber-500 uppercase",
							children: "Maintenance / Service"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-amber-600 dark:text-amber-400 mt-1",
							children: [statistics.maintenance || 0, " Unit"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-rose-500 uppercase",
							children: "Breakdown (BD)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xl font-bold text-rose-600 dark:text-rose-400 mt-1",
							children: [statistics.breakdown || 0, " Unit"]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-full sm:max-w-xs",
						children: /* @__PURE__ */ jsx(SearchBar, {
							value: search,
							onChange: (val) => setSearch(val),
							onClear: () => {
								setSearch("");
								applyFilters({ search: "" });
							},
							placeholder: "Cari No. Lambung, Plat, Brand..."
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-44",
								children: /* @__PURE__ */ jsx(Select, {
									value: unitType,
									onChange: (e) => {
										setUnitType(e.target.value);
										applyFilters({ unit_type: e.target.value });
									},
									options: [
										{
											value: "all",
											label: "Semua Jenis Unit"
										},
										{
											value: "dump_truck_10",
											label: "Dump Truck 10 Roda"
										},
										{
											value: "dump_truck_12",
											label: "Dump Truck 12 Roda"
										},
										{
											value: "light_vehicle",
											label: "Light Vehicle"
										},
										{
											value: "fuel_truck",
											label: "Fuel Truck"
										},
										{
											value: "service_truck",
											label: "Service Truck"
										},
										{
											value: "support_equipment",
											label: "Support Equipment"
										}
									],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "w-36",
								children: /* @__PURE__ */ jsx(Select, {
									value: status,
									onChange: (e) => {
										setStatus(e.target.value);
										applyFilters({ status: e.target.value });
									},
									options: [
										{
											value: "all",
											label: "Semua Status"
										},
										{
											value: "operating",
											label: "Operating"
										},
										{
											value: "standby",
											label: "Standby"
										},
										{
											value: "maintenance",
											label: "Maintenance"
										},
										{
											value: "breakdown",
											label: "Breakdown"
										}
									],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "w-36",
								children: /* @__PURE__ */ jsx(Select, {
									value: siteId,
									onChange: (e) => {
										setSiteId(e.target.value);
										applyFilters({ site_id: e.target.value });
									},
									options: [{
										value: "all",
										label: "Semua Site"
									}, ...sites.map((s) => ({
										value: s.id,
										label: s.name
									}))],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "primary",
								icon: Plus,
								onClick: openCreateModal,
								children: "Tambah Unit"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "No. Lambung & Plat"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Jenis Unit"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Merek & Model"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kapasitas (Ton / M3)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "HM & KM Terakhir"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site / Kepemilikan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status Unit"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: units.data.map((unit) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-extrabold text-sm text-indigo-600 dark:text-indigo-400 font-mono",
											children: unit.unit_code
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-500 font-mono",
											children: unit.registration_number
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200",
										children: getUnitTypeLabel(unit.unit_type)
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 text-slate-700 dark:text-slate-300",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold",
											children: unit.brand
										}), /* @__PURE__ */ jsxs("p", {
											className: "text-[11px] text-slate-400",
											children: [
												unit.model,
												" (",
												unit.year || "-",
												")"
											]
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200",
										children: [
											unit.capacity_ton,
											" Ton / ",
											unit.capacity_m3,
											" M3"
										]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "font-mono text-slate-800 dark:text-slate-200",
											children: [Number(unit.last_hm).toLocaleString(), " HM"]
										}), /* @__PURE__ */ jsxs("p", {
											className: "text-[11px] text-slate-400 font-mono",
											children: [Number(unit.last_km).toLocaleString(), " KM"]
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold",
											children: unit.site?.name || "-"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-400",
											children: unit.vendor?.name ? `Rental: ${unit.vendor.name}` : "Aset Milik TAP"
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: getStatusBadge(unit.status)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditModal(unit),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(unit),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, unit.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: units.links,
					from: units.from,
					to: units.to,
					total: units.total
				})]
			}),
			isModalOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setIsModalOpen(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingUnit ? "Edit Unit Armada" : "Registrasi Unit Armada Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setIsModalOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Nomor Lambung (Unit ID)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.unit_code,
											onChange: (e) => setFormData({
												...formData,
												unit_code: e.target.value
											}),
											placeholder: "cth. DT-101",
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Nomor Polisi (Plat)",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: formData.registration_number,
											onChange: (e) => setFormData({
												...formData,
												registration_number: e.target.value
											}),
											placeholder: "cth. KT 8101 MT",
											required: true
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsx(FormField, {
											label: "Jenis Unit",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.unit_type,
												onChange: (e) => setFormData({
													...formData,
													unit_type: e.target.value
												}),
												options: [
													{
														value: "dump_truck_10",
														label: "Dump Truck 10 Roda"
													},
													{
														value: "dump_truck_12",
														label: "Dump Truck 12 Roda"
													},
													{
														value: "light_vehicle",
														label: "Light Vehicle"
													},
													{
														value: "fuel_truck",
														label: "Fuel Truck"
													},
													{
														value: "service_truck",
														label: "Service Truck"
													},
													{
														value: "support_equipment",
														label: "Support Equipment"
													}
												],
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Merek (Brand)",
											required: true,
											children: /* @__PURE__ */ jsx(Input, {
												value: formData.brand,
												onChange: (e) => setFormData({
													...formData,
													brand: e.target.value
												}),
												placeholder: "Hino / Scania / Volvo",
												required: true
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Model / Seri",
											children: /* @__PURE__ */ jsx(Input, {
												value: formData.model,
												onChange: (e) => setFormData({
													...formData,
													model: e.target.value
												}),
												placeholder: "500 FM 260 JD"
											})
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsx(FormField, {
											label: "Kapasitas Angkut (Ton)",
											required: true,
											children: /* @__PURE__ */ jsx(Input, {
												type: "number",
												step: "0.1",
												value: formData.capacity_ton,
												onChange: (e) => setFormData({
													...formData,
													capacity_ton: e.target.value
												}),
												required: true
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Volume Bak (M3)",
											children: /* @__PURE__ */ jsx(Input, {
												type: "number",
												step: "0.1",
												value: formData.capacity_m3,
												onChange: (e) => setFormData({
													...formData,
													capacity_m3: e.target.value
												})
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Tahun Pembuatan",
											children: /* @__PURE__ */ jsx(Input, {
												type: "number",
												value: formData.year,
												onChange: (e) => setFormData({
													...formData,
													year: e.target.value
												})
											})
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Hour Meter (HM) Terakhir",
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											step: "0.1",
											value: formData.last_hm,
											onChange: (e) => setFormData({
												...formData,
												last_hm: e.target.value
											})
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Kilo Meter (KM) Terakhir",
										children: /* @__PURE__ */ jsx(Input, {
											type: "number",
											step: "0.1",
											value: formData.last_km,
											onChange: (e) => setFormData({
												...formData,
												last_km: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ jsx(FormField, {
											label: "Status Operasional Unit",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.status,
												onChange: (e) => setFormData({
													...formData,
													status: e.target.value
												}),
												options: [
													{
														value: "operating",
														label: "Operating (Siap Jalan)"
													},
													{
														value: "standby",
														label: "Standby"
													},
													{
														value: "maintenance",
														label: "Maintenance"
													},
													{
														value: "breakdown",
														label: "Breakdown (Rusak)"
													}
												],
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Penempatan Site",
											required: true,
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.site_id,
												onChange: (e) => setFormData({
													...formData,
													site_id: e.target.value
												}),
												options: sites.map((s) => ({
													value: s.id,
													label: s.name
												})),
												placeholder: ""
											})
										}),
										/* @__PURE__ */ jsx(FormField, {
											label: "Kepemilikan / Vendor Rental",
											children: /* @__PURE__ */ jsx(Select, {
												value: formData.vendor_id,
												onChange: (e) => setFormData({
													...formData,
													vendor_id: e.target.value
												}),
												options: [{
													value: "",
													label: "Milik TAP Sendiri"
												}, ...vendors.map((v) => ({
													value: v.id,
													label: v.name
												}))],
												placeholder: ""
											})
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setIsModalOpen(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Unit Armada"
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
// resources/js/Pages/Users/Index.jsx
var Index_exports$1 = /* @__PURE__ */ __exportAll({ default: () => UsersIndex });
function UsersIndex({ users, filters = {}, roles = [], sites = [], companies = [], employees = [], statistics = {} }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [role, setRole] = useState(filters.role || "all");
	const [status, setStatus] = useState(filters.status || "all");
	const [siteId, setSiteId] = useState(filters.site_id || "all");
	const [sortBy, setSortBy] = useState(filters.sort_by || "created_at");
	const [sortDirection, setSortDirection] = useState(filters.sort_direction || "desc");
	const [perPage, setPerPage] = useState(filters.per_page || 10);
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
		employee_id: "",
		site_id: "",
		company_id: "",
		role_ids: [],
		password: ""
	});
	const isFirstRender = useRef(true);
	const applyFilters = (newOverrides = {}) => {
		const queryParams = {
			search: newOverrides.search !== void 0 ? newOverrides.search : search,
			role: newOverrides.role !== void 0 ? newOverrides.role : role,
			status: newOverrides.status !== void 0 ? newOverrides.status : status,
			site_id: newOverrides.site_id !== void 0 ? newOverrides.site_id : siteId,
			per_page: newOverrides.perPage !== void 0 ? newOverrides.perPage : perPage,
			sort_by: newOverrides.sortBy !== void 0 ? newOverrides.sortBy : sortBy,
			sort_direction: newOverrides.sortDirection !== void 0 ? newOverrides.sortDirection : sortDirection
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.role === "all") delete queryParams.role;
		if (queryParams.status === "all") delete queryParams.status;
		if (queryParams.site_id === "all") delete queryParams.site_id;
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
	const openCreateModal = () => {
		setEditingUser(null);
		setFormData({
			name: "",
			email: "",
			role: "dispatcher",
			status: "active",
			phone: "",
			employee_id: "",
			site_id: sites[0]?.id || "",
			company_id: companies[0]?.id || "",
			role_ids: roles[0] ? [roles[0].id] : [],
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
			role: user.role || "user",
			status: user.status,
			phone: user.phone || "",
			employee_id: user.employee_id || "",
			site_id: user.site_id || "",
			company_id: user.company_id || "",
			role_ids: user.roles ? user.roles.map((r) => r.id) : [],
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
			onSuccess: () => setIsModalOpen(false),
			onError: (errors) => setFormErrors(errors),
			onFinish: () => setIsSubmitting(false)
		});
		else router.post("/users", formData, {
			onSuccess: () => setIsModalOpen(false),
			onError: (errors) => setFormErrors(errors),
			onFinish: () => setIsSubmitting(false)
		});
	};
	const handleDeleteUser = async (user) => {
		if (await confirm({
			title: `Hapus Pengguna: ${user.name}?`,
			message: `Akun dengan email ${user.email} akan dipindahkan ke arsip soft delete.`,
			confirmButtonText: "Ya, Hapus Akun",
			cancelButtonText: "Batalkan",
			type: "danger"
		})) router.delete(`/users/${user.id}`, { preserveScroll: true });
	};
	const getRoleBadge = (user) => {
		if (user.roles && user.roles.length > 0) return /* @__PURE__ */ jsx("div", {
			className: "flex flex-wrap gap-1",
			children: user.roles.map((r) => /* @__PURE__ */ jsx(Badge, {
				variant: "purple",
				size: "sm",
				children: r.label
			}, r.id))
		});
		return /* @__PURE__ */ jsx(Badge, {
			variant: "default",
			size: "sm",
			children: user.role || "User"
		});
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
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Manajemen Pengguna & Akun Sistem (SSR)",
		breadcrumbs: ["Keamanan", "Pengguna"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-slate-400 uppercase",
							children: "Total Akun"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xl font-bold text-slate-900 dark:text-white mt-1",
							children: statistics.total || 0
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-emerald-500 uppercase",
							children: "Akun Aktif"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1",
							children: statistics.active || 0
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-amber-500 uppercase",
							children: "Nonaktif"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xl font-bold text-amber-600 dark:text-amber-400 mt-1",
							children: statistics.inactive || 0
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold text-rose-500 uppercase",
							children: "Ditangguhkan"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xl font-bold text-rose-600 dark:text-rose-400 mt-1",
							children: statistics.suspended || 0
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-full sm:max-w-xs",
						children: /* @__PURE__ */ jsx(SearchBar, {
							value: search,
							onChange: (val) => setSearch(val),
							onClear: () => {
								setSearch("");
								applyFilters({ search: "" });
							},
							placeholder: "Cari Nama, Email, Telepon..."
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2.5",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "w-40",
								children: /* @__PURE__ */ jsx(Select, {
									value: role,
									onChange: (e) => {
										setRole(e.target.value);
										applyFilters({ role: e.target.value });
									},
									options: [{
										value: "all",
										label: "Semua Role"
									}, ...roles.map((r) => ({
										value: r.name,
										label: r.label
									}))],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx("div", {
								className: "w-32",
								children: /* @__PURE__ */ jsx(Select, {
									value: status,
									onChange: (e) => {
										setStatus(e.target.value);
										applyFilters({ status: e.target.value });
									},
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
								className: "w-36",
								children: /* @__PURE__ */ jsx(Select, {
									value: siteId,
									onChange: (e) => {
										setSiteId(e.target.value);
										applyFilters({ site_id: e.target.value });
									},
									options: [{
										value: "all",
										label: "Semua Site"
									}, ...sites.map((s) => ({
										value: s.id,
										label: s.name
									}))],
									placeholder: ""
								})
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "primary",
								icon: UserPlus,
								onClick: openCreateModal,
								children: "Tambah Pengguna"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Pengguna & Email"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Role / Peran Sistem"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Karyawan Terhubung"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site Penugasan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status Akun"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: users.data.map((user) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ jsx(Avatar, {
												src: user.avatar,
												name: user.name,
												size: "sm"
											}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "font-bold text-slate-900 dark:text-white",
												children: user.name
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-slate-400",
												children: user.email
											})] })]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: getRoleBadge(user)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: user.employee ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold",
											children: user.employee.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[10px] font-mono text-indigo-600 dark:text-indigo-400",
											children: user.employee.employee_code
										})] }) : /* @__PURE__ */ jsx("span", {
											className: "text-slate-400",
											children: "Akun Khusus / IT"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: user.site?.name || "Head Office"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: getStatusBadge(user.status)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEditModal(user),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDeleteUser(user),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, user.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: users.links,
					from: users.from,
					to: users.to,
					total: users.total
				})]
			}),
			isModalOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setIsModalOpen(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setIsModalOpen(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleFormSubmit,
							className: "mt-4 space-y-3 text-xs",
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
										required: true
									})
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Alamat Email (Login)",
									error: formErrors.email,
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										type: "email",
										value: formData.email,
										onChange: (e) => setFormData({
											...formData,
											email: e.target.value
										}),
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Role Hak Akses (RBAC)",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.role_ids[0] || "",
											onChange: (e) => setFormData({
												...formData,
												role_ids: [Number(e.target.value)]
											}),
											options: roles.map((r) => ({
												value: r.id,
												label: r.label
											})),
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Status Akun",
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
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Tautkan ke Karyawan",
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.employee_id,
											onChange: (e) => setFormData({
												...formData,
												employee_id: e.target.value
											}),
											options: [{
												value: "",
												label: "Tanpa Tautan Karyawan"
											}, ...employees.map((emp) => ({
												value: emp.id,
												label: `${emp.name} (${emp.employee_code})`
											}))],
											placeholder: ""
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Site Penugasan",
										children: /* @__PURE__ */ jsx(Select, {
											value: formData.site_id,
											onChange: (e) => setFormData({
												...formData,
												site_id: e.target.value
											}),
											options: [{
												value: "",
												label: "Head Office (Semua Site)"
											}, ...sites.map((s) => ({
												value: s.id,
												label: s.name
											}))],
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: editingUser ? "Password (Kosongkan jika tidak diubah)" : "Password",
									required: !editingUser,
									children: /* @__PURE__ */ jsx(Input, {
										type: "password",
										value: formData.password,
										onChange: (e) => setFormData({
											...formData,
											password: e.target.value
										}),
										placeholder: "Minimal 6 karakter",
										required: !editingUser
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setIsModalOpen(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										isLoading: isSubmitting,
										children: "Simpan Pengguna"
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
// resources/js/Pages/Vendors/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => VendorsIndex });
function VendorsIndex({ vendors, filters = {} }) {
	const { confirm } = useAlertStore();
	const [search, setSearch] = useState(filters.search || "");
	const [vendorType, setVendorType] = useState(filters.vendor_type || "all");
	const [modal, setModal] = useState(false);
	const [editing, setEditing] = useState(null);
	const [form, setForm] = useState({
		vendor_code: "",
		name: "",
		vendor_type: "spareparts",
		address: "",
		contact_person: "",
		phone: "",
		email: "",
		npwp: "",
		is_active: true
	});
	const applyFilters = (overrides = {}) => {
		const queryParams = {
			search: overrides.search !== void 0 ? overrides.search : search,
			vendor_type: overrides.vendor_type !== void 0 ? overrides.vendor_type : vendorType
		};
		if (!queryParams.search) delete queryParams.search;
		if (queryParams.vendor_type === "all") delete queryParams.vendor_type;
		router.get("/master/vendors", queryParams, {
			preserveState: true,
			replace: true
		});
	};
	const openCreate = () => {
		setEditing(null);
		setForm({
			vendor_code: `VND-${Math.floor(100 + Math.random() * 900)}`,
			name: "",
			vendor_type: "spareparts",
			address: "",
			contact_person: "",
			phone: "",
			email: "",
			npwp: "",
			is_active: true
		});
		setModal(true);
	};
	const openEdit = (v) => {
		setEditing(v);
		setForm({
			vendor_code: v.vendor_code,
			name: v.name,
			vendor_type: v.vendor_type,
			address: v.address || "",
			contact_person: v.contact_person || "",
			phone: v.phone || "",
			email: v.email || "",
			npwp: v.npwp || "",
			is_active: v.is_active
		});
		setModal(true);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		if (editing) router.put(`/master/vendors/${editing.id}`, form, { onSuccess: () => setModal(false) });
		else router.post("/master/vendors", form, { onSuccess: () => setModal(false) });
	};
	const handleDelete = async (v) => {
		if (await confirm({
			title: `Hapus Vendor: ${v.name}?`,
			message: "Pastikan vendor tidak memiliki kontrak unit rental yang sedang berjalan."
		})) router.delete(`/master/vendors/${v.id}`);
	};
	const getTypeLabel = (t) => {
		return {
			spareparts: "Spare Parts & Komponen",
			tyre: "Ban / Tyre Dump Truck",
			fuel: "Bahan Bakar Solar (HSD)",
			subcontractor: "Sub-kontraktor Hauling",
			rental: "Rental Alat Berat / Unit",
			service: "Service & Maintenance"
		}[t] || t;
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, {
		title: "Master Vendor & Rekanan Bisnis (SSR)",
		breadcrumbs: ["Master Data", "Vendor"],
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-full sm:max-w-xs",
					children: /* @__PURE__ */ jsx(SearchBar, {
						value: search,
						onChange: (val) => {
							setSearch(val);
							applyFilters({ search: val });
						},
						onClear: () => {
							setSearch("");
							applyFilters({ search: "" });
						},
						placeholder: "Cari Vendor, PIC, Telepon..."
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("div", {
						className: "w-48",
						children: /* @__PURE__ */ jsx(Select, {
							value: vendorType,
							onChange: (e) => {
								setVendorType(e.target.value);
								applyFilters({ vendor_type: e.target.value });
							},
							options: [
								{
									value: "all",
									label: "Semua Kategori Vendor"
								},
								{
									value: "spareparts",
									label: "Spare Parts"
								},
								{
									value: "tyre",
									label: "Ban / Tyre"
								},
								{
									value: "fuel",
									label: "Fuel / Solar"
								},
								{
									value: "subcontractor",
									label: "Subkontraktor"
								},
								{
									value: "rental",
									label: "Rental Unit"
								},
								{
									value: "service",
									label: "Service & Jasa"
								}
							],
							placeholder: ""
						})
					}), /* @__PURE__ */ jsx(Button, {
						variant: "primary",
						icon: Plus,
						onClick: openCreate,
						children: "Tambah Vendor"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800/40 uppercase font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode & Nama Vendor"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kategori Layanan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kontak Person (PIC)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Unit Terkait"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800/60",
							children: vendors.data.map((v) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-bold text-slate-900 dark:text-white",
											children: v.name
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-indigo-600 dark:text-indigo-400 font-mono",
											children: v.vendor_code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300",
										children: getTypeLabel(v.vendor_type)
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3.5 px-4 text-slate-600 dark:text-slate-300",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold",
											children: v.contact_person || "-"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-400",
											children: v.phone || v.email || "-"
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsxs(Badge, {
											variant: "primary",
											children: [v.units_count || 0, " Unit"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: v.is_active ? "success" : "warning",
											dot: true,
											children: v.is_active ? "Mitra Aktif" : "Nonaktif"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3.5 px-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openEdit(v),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => handleDelete(v),
												className: "p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800",
												children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, v.id))
						})]
					})
				}), /* @__PURE__ */ jsx(PaginationControls, {
					links: vendors.links,
					from: vendors.from,
					to: vendors.to,
					total: vendors.total
				})]
			}),
			modal && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 overflow-y-auto",
				children: [/* @__PURE__ */ jsx("div", {
					className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs",
					onClick: () => setModal(false)
				}), /* @__PURE__ */ jsx("div", {
					className: "flex min-h-full items-center justify-center p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl",
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "font-bold text-sm text-slate-900 dark:text-white",
								children: editing ? "Edit Vendor" : "Tambah Vendor Rekanan"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => setModal(false),
								className: "text-slate-400 hover:text-slate-600",
								children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
							})]
						}), /* @__PURE__ */ jsxs("form", {
							onSubmit: handleSubmit,
							className: "mt-4 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Kode Vendor",
										required: true,
										children: /* @__PURE__ */ jsx(Input, {
											value: form.vendor_code,
											onChange: (e) => setForm({
												...form,
												vendor_code: e.target.value
											}),
											required: true
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "Kategori Vendor",
										required: true,
										children: /* @__PURE__ */ jsx(Select, {
											value: form.vendor_type,
											onChange: (e) => setForm({
												...form,
												vendor_type: e.target.value
											}),
											options: [
												{
													value: "spareparts",
													label: "Spare Parts"
												},
												{
													value: "tyre",
													label: "Ban / Tyre"
												},
												{
													value: "fuel",
													label: "Fuel / Solar"
												},
												{
													value: "subcontractor",
													label: "Subkontraktor"
												},
												{
													value: "rental",
													label: "Rental Unit"
												},
												{
													value: "service",
													label: "Service & Jasa"
												}
											],
											placeholder: ""
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Nama Perusahaan Vendor",
									required: true,
									children: /* @__PURE__ */ jsx(Input, {
										value: form.name,
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										}),
										placeholder: "cth. PT United Tractors Tbk",
										required: true
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Kontak Person (PIC)",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.contact_person,
											onChange: (e) => setForm({
												...form,
												contact_person: e.target.value
											}),
											placeholder: "Nama PIC Vendor"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "No. Telepon / WA",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.phone,
											onChange: (e) => setForm({
												...form,
												phone: e.target.value
											}),
											placeholder: "+62 812-xxxx-xxxx"
										})
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(FormField, {
										label: "Alamat Email",
										children: /* @__PURE__ */ jsx(Input, {
											type: "email",
											value: form.email,
											onChange: (e) => setForm({
												...form,
												email: e.target.value
											}),
											placeholder: "vendor@example.com"
										})
									}), /* @__PURE__ */ jsx(FormField, {
										label: "NPWP",
										children: /* @__PURE__ */ jsx(Input, {
											value: form.npwp,
											onChange: (e) => setForm({
												...form,
												npwp: e.target.value
											}),
											placeholder: "01.234.567.8-000.000"
										})
									})]
								}),
								/* @__PURE__ */ jsx(FormField, {
									label: "Alamat Kantor / Workshop",
									children: /* @__PURE__ */ jsx(Input, {
										value: form.address,
										onChange: (e) => setForm({
											...form,
											address: e.target.value
										}),
										placeholder: "Alamat lengkap vendor"
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2",
									children: [/* @__PURE__ */ jsx(Button, {
										variant: "secondary",
										onClick: () => setModal(false),
										children: "Batal"
									}), /* @__PURE__ */ jsx(Button, {
										variant: "primary",
										type: "submit",
										children: "Simpan Vendor"
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
			"./Pages/Analytics/Index.jsx": Index_exports$12,
			"./Pages/Customers/Index.jsx": Index_exports$11,
			"./Pages/Dashboard/Index.jsx": Index_exports$10,
			"./Pages/Drivers/Index.jsx": Index_exports$9,
			"./Pages/Employees/Index.jsx": Index_exports$8,
			"./Pages/Locations/Index.jsx": Index_exports$7,
			"./Pages/Materials/Index.jsx": Index_exports$6,
			"./Pages/Organization/Index.jsx": Index_exports$5,
			"./Pages/Security/ActivityLogs.jsx": ActivityLogs_exports,
			"./Pages/Security/Roles.jsx": Roles_exports,
			"./Pages/Settings/Configuration.jsx": Configuration_exports,
			"./Pages/Settings/Index.jsx": Index_exports$4,
			"./Pages/Shifts/Index.jsx": Index_exports$3,
			"./Pages/Units/Index.jsx": Index_exports$2,
			"./Pages/Users/Index.jsx": Index_exports$1,
			"./Pages/Vendors/Index.jsx": Index_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
export {};
