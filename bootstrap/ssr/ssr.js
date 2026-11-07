import React, { forwardRef, useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Activity, AlertCircle, AlertOctagon, AlertTriangle, ArrowDownRight, ArrowLeft, ArrowUpRight, BarChart3, Bell, BellRing, Briefcase, Building2, Calendar, CalendarCheck, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardCheck, Clock, Database, Download, Edit, Edit3, Eye, FileSpreadsheet, FileText, Filter, Gauge, Hash, HelpCircle, History, Info, Layers, LayoutDashboard, LogOut, MapPin, Menu, Minus, Moon, Network, Plus, RefreshCw, Route, Save, Scale, Search, Settings, Shield, ShieldAlert, ShieldCheck, Sparkles, Sun, Target, Ticket, Trash2, TrendingUp, Truck, UploadCloud, User, UserCheck, UserPlus, Users, Wrench, X, XCircle } from "lucide-react";
import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/react";
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
				name: "Overview Eksekutif",
				href: "/dashboard",
				icon: LayoutDashboard,
				active: url === "/dashboard" || url === "/"
			}, {
				name: "Dashboard Produksi",
				href: "/production/dashboard",
				icon: TrendingUp,
				badge: "Phase 2",
				badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
				active: url.startsWith("/production/dashboard")
			}]
		},
		{
			title: "Manajemen Produksi Hauling",
			items: [
				{
					name: "Daily Dispatch",
					href: "/production/dispatch",
					icon: CalendarCheck,
					badge: "Jadwal",
					badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
					active: url.startsWith("/production/dispatch")
				},
				{
					name: "Loading & Hauling",
					href: "/production/hauling",
					icon: Route,
					active: url.startsWith("/production/hauling")
				},
				{
					name: "Tiket Dumping",
					href: "/production/tickets",
					icon: Ticket,
					badge: "Tiket",
					badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
					active: url.startsWith("/production/tickets") && !url.includes("verification-queue")
				},
				{
					name: "Verifikasi Tiket",
					href: "/production/tickets/verification-queue",
					icon: CheckCircle2,
					badge: "Workflow",
					badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
					active: url.includes("/production/tickets/verification-queue")
				},
				{
					name: "Bulk Import Tiket",
					href: "/production/import",
					icon: UploadCloud,
					active: url.startsWith("/production/import")
				},
				{
					name: "Rekap Produksi",
					href: "/production/recap",
					icon: BarChart3,
					badge: "Official",
					badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
					active: url.startsWith("/production/recap")
				},
				{
					name: "Target Produksi",
					href: "/production/targets",
					icon: Target,
					active: url.startsWith("/production/targets")
				},
				{
					name: "Rekonsiliasi JSI",
					href: "/production/reconciliation",
					icon: Scale,
					badge: "TAP vs JSI",
					badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
					active: url.startsWith("/production/reconciliation")
				}
			]
		},
		{
			title: "Manajemen Fleet & Alat Berat",
			items: [
				{
					name: "Unit Registry & Status",
					href: "/fleet/registry",
					icon: Truck,
					badge: "Phase 3",
					badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
					active: url.startsWith("/fleet/registry")
				},
				{
					name: "Digital P2H",
					href: "/fleet/p2h",
					icon: ClipboardCheck,
					badge: "K3LH",
					badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
					active: url.startsWith("/fleet/p2h")
				},
				{
					name: "Monitoring HM/KM",
					href: "/fleet/hm-km",
					icon: Gauge,
					badge: "PM Service",
					badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
					active: url.startsWith("/fleet/hm-km")
				},
				{
					name: "Work Order Perbaikan",
					href: "/fleet/work-orders",
					icon: Wrench,
					badge: "Maintenance",
					badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
					active: url.startsWith("/fleet/work-orders")
				},
				{
					name: "Fleet KPI (PA/MA/UA)",
					href: "/fleet/kpi",
					icon: Activity,
					badge: "Availability",
					badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
					active: url.startsWith("/fleet/kpi")
				}
			]
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
var Index_exports$24 = /* @__PURE__ */ __exportAll({ default: () => AnalyticsIndex });
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
var Index_exports$23 = /* @__PURE__ */ __exportAll({ default: () => CustomersIndex });
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
var Index_exports$22 = /* @__PURE__ */ __exportAll({ default: () => DashboardIndex });
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
var Index_exports$21 = /* @__PURE__ */ __exportAll({ default: () => DriversIndex });
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
var Index_exports$20 = /* @__PURE__ */ __exportAll({ default: () => EmployeesIndex });
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
// resources/js/components/molecules/Card.jsx
function Card({ children, className = "", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		className: `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 ${className}`,
		...props,
		children
	});
}
// resources/js/components/molecules/Modal.jsx
function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);
	if (!isOpen) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto",
		children: [/* @__PURE__ */ jsx("div", {
			className: "fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("div", {
			className: `relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full ${maxWidth} z-10 overflow-hidden transform transition-all my-8 max-h-[90vh] flex flex-col`,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-base font-bold text-slate-900 dark:text-white",
					children: title
				}), /* @__PURE__ */ jsx("button", {
					onClick: onClose,
					className: "p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition",
					children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "p-5 overflow-y-auto",
				children
			})]
		})]
	});
}
// resources/js/components/molecules/Pagination.jsx
function Pagination({ links = [] }) {
	if (!links || links.length <= 1) return null;
	return /* @__PURE__ */ jsx(PaginationControls, { links });
}
// resources/js/Pages/Fleet/HMKM/Index.jsx
var Index_exports$19 = /* @__PURE__ */ __exportAll({ default: () => HmKmMonitoringIndex });
function HmKmMonitoringIndex({ logs = {
	data: [],
	links: []
}, serviceIntervals = [], filters = {}, kpi = {}, master = {} }) {
	const [dateFrom, setDateFrom] = useState(filters.date_from || "");
	const [dateTo, setDateTo] = useState(filters.date_to || "");
	const [unitId, setUnitId] = useState(filters.unit_id || "");
	const [shiftId, setShiftId] = useState(filters.shift_id || "");
	const [onlyAnomaly, setOnlyAnomaly] = useState(filters.only_anomaly || false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("logs");
	const form = useForm({
		unit_id: master.units?.[0]?.id || "",
		driver_id: master.drivers?.[0]?.id || "",
		shift_id: master.shifts?.[0]?.id || "",
		log_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		start_hm: master.units?.[0]?.last_hm || 0,
		end_hm: (Number(master.units?.[0]?.last_hm || 0) + 9.5).toFixed(1),
		start_km: master.units?.[0]?.last_km || 0,
		end_km: (Number(master.units?.[0]?.last_km || 0) + 180).toFixed(1),
		notes: ""
	});
	const handleFilter = (e) => {
		e?.preventDefault();
		router.get("/fleet/hm-km", {
			date_from: dateFrom,
			date_to: dateTo,
			unit_id: unitId,
			shift_id: shiftId,
			only_anomaly: onlyAnomaly ? "1" : ""
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleReset = () => {
		setDateFrom("");
		setDateTo("");
		setUnitId("");
		setShiftId("");
		setOnlyAnomaly(false);
		router.get("/fleet/hm-km");
	};
	const handleUnitSelect = (id) => {
		const u = master.units?.find((item) => item.id == id);
		const lastHm = Number(u?.last_hm || 0);
		const lastKm = Number(u?.last_km || 0);
		form.setData({
			...form.data,
			unit_id: id,
			start_hm: lastHm,
			end_hm: (lastHm + 10).toFixed(1),
			start_km: lastKm,
			end_km: (lastKm + 200).toFixed(1)
		});
	};
	const calcDeltaHm = (Number(form.data.end_hm) - Number(form.data.start_hm)).toFixed(1);
	const calcDeltaKm = (Number(form.data.end_km) - Number(form.data.start_km)).toFixed(1);
	const isCalculatedAnomaly = Number(calcDeltaHm) > 14 || Number(calcDeltaKm) > 600;
	const isNegativeDelta = Number(calcDeltaHm) < 0 || Number(calcDeltaKm) < 0;
	const submitLog = (e) => {
		e.preventDefault();
		form.post("/fleet/hm-km", { onSuccess: () => {
			form.reset();
			setIsCreateOpen(false);
		} });
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Monitoring HM/KM & PM Planner - TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2.5 rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
							children: /* @__PURE__ */ jsx(Gauge, { className: "w-6 h-6" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold text-slate-900 dark:text-white",
							children: "Monitoring HM/KM & PM Service Planner"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-500 dark:text-slate-400",
							children: "Pencatatan hour meter & odometer per shift, audit anomali angka, dan pemantauan interval servis berkala (PM 250 - PM 2000)"
						})] })]
					}) }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3 w-full sm:w-auto",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "secondary",
							onClick: () => router.get("/fleet/hm-km"),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Segarkan" })]
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "primary",
							onClick: () => setIsCreateOpen(true),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Catat HM/KM Shift" })]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4",
					children: [
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Total Catatan"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: kpi.total_logs || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Shift"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-cyan-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider",
								children: "Jam Operasi (HM)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-cyan-600 dark:text-cyan-400",
									children: kpi.total_operating_hm || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-cyan-600/80",
									children: "Jam Mesin"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Total Jarak (KM)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: kpi.total_distance_km || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Kilometer"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider",
								children: "Anomali Terdeteksi"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-600 dark:text-rose-400",
									children: kpi.anomalies_detected || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Kasus"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider",
								children: "Servis Mendekati"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-amber-600 dark:text-amber-400",
									children: kpi.service_due_soon || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-amber-500",
									children: "Due Soon"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-700",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider",
								children: "Servis Terlewat"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-700 dark:text-rose-400",
									children: kpi.service_overdue || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Overdue!"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex border-b border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("logs"),
						className: `py-3 px-6 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${activeTab === "logs" ? "border-cyan-500 text-cyan-600 dark:text-cyan-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"}`,
						children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Log HM/KM Harian & Anomali" })]
					}), /* @__PURE__ */ jsxs("button", {
						onClick: () => setActiveTab("intervals"),
						className: `py-3 px-6 font-semibold text-sm border-b-2 transition flex items-center space-x-2 ${activeTab === "intervals" ? "border-cyan-500 text-cyan-600 dark:text-cyan-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"}`,
						children: [
							/* @__PURE__ */ jsx(Wrench, { className: "w-4 h-4" }),
							/* @__PURE__ */ jsx("span", { children: "Program Servis Berkala (PM Planner)" }),
							(kpi.service_due_soon > 0 || kpi.service_overdue > 0) && /* @__PURE__ */ jsxs("span", {
								className: "px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold",
								children: [kpi.service_due_soon + kpi.service_overdue, " Alert"]
							})
						]
					})]
				}),
				activeTab === "logs" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Card, {
					className: "p-5 bg-white dark:bg-slate-800",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: handleFilter,
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Dari Tanggal"
							}), /* @__PURE__ */ jsx("input", {
								type: "date",
								value: dateFrom,
								onChange: (e) => setDateFrom(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Sampai Tanggal"
							}), /* @__PURE__ */ jsx("input", {
								type: "date",
								value: dateTo,
								onChange: (e) => setDateTo(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit"
							}), /* @__PURE__ */ jsxs("select", {
								value: unitId,
								onChange: (e) => setUnitId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Unit"
								}), master.units?.map((u) => /* @__PURE__ */ jsx("option", {
									value: u.id,
									children: u.unit_code
								}, u.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Shift"
							}), /* @__PURE__ */ jsxs("select", {
								value: shiftId,
								onChange: (e) => setShiftId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Shift"
								}), master.shifts?.map((s) => /* @__PURE__ */ jsx("option", {
									value: s.id,
									children: s.name
								}, s.id))]
							})] }),
							/* @__PURE__ */ jsx("div", {
								className: "flex items-center pt-5",
								children: /* @__PURE__ */ jsxs("label", {
									className: "flex items-center space-x-2 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer",
									children: [/* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: onlyAnomaly,
										onChange: (e) => setOnlyAnomaly(e.target.checked),
										className: "rounded text-rose-600 focus:ring-rose-500"
									}), /* @__PURE__ */ jsx("span", { children: "Hanya Anomali" })]
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end space-x-2",
								children: [/* @__PURE__ */ jsxs(Button, {
									type: "submit",
									variant: "primary",
									className: "flex-1 flex items-center justify-center space-x-1",
									children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Filter" })]
								}), /* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "secondary",
									onClick: handleReset,
									children: "Reset"
								})]
							})
						]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse text-sm",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Tanggal & Shift"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Armada & Driver"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Hour Meter (HM)"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Delta HM"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Odometer (KM)"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Delta KM"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Status & Anomali"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-200 dark:divide-slate-700",
								children: logs.data?.length > 0 ? logs.data.map((log) => /* @__PURE__ */ jsxs("tr", {
									className: `hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${log.is_anomaly ? "bg-rose-50/60 dark:bg-rose-950/20" : ""}`,
									children: [
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "font-bold text-slate-900 dark:text-white",
												children: log.log_date
											}), /* @__PURE__ */ jsxs("div", {
												className: "text-xs text-slate-500",
												children: [
													log.shift?.name,
													" (",
													log.shift?.code,
													")"
												]
											})]
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "font-bold text-slate-900 dark:text-white flex items-center space-x-1.5",
												children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: log.unit?.unit_code })]
											}), /* @__PURE__ */ jsx("div", {
												className: "text-xs text-slate-500 dark:text-slate-400",
												children: log.driver?.employee?.name || "Driver Shift"
											})]
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4 font-mono text-xs",
											children: [/* @__PURE__ */ jsxs("div", { children: ["Awal: ", /* @__PURE__ */ jsx("span", {
												className: "font-bold text-slate-900 dark:text-white",
												children: Number(log.start_hm).toLocaleString("id-ID")
											})] }), /* @__PURE__ */ jsxs("div", { children: ["Akhir: ", /* @__PURE__ */ jsx("span", {
												className: "font-bold text-slate-900 dark:text-white",
												children: Number(log.end_hm).toLocaleString("id-ID")
											})] })]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: /* @__PURE__ */ jsxs("span", {
												className: `inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${log.diff_hm > 14 ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"}`,
												children: [
													"+",
													Number(log.diff_hm).toFixed(1),
													" Jam"
												]
											})
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4 font-mono text-xs",
											children: [/* @__PURE__ */ jsxs("div", { children: ["Awal: ", /* @__PURE__ */ jsx("span", {
												className: "font-bold text-slate-900 dark:text-white",
												children: Number(log.start_km).toLocaleString("id-ID")
											})] }), /* @__PURE__ */ jsxs("div", { children: ["Akhir: ", /* @__PURE__ */ jsx("span", {
												className: "font-bold text-slate-900 dark:text-white",
												children: Number(log.end_km).toLocaleString("id-ID")
											})] })]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: /* @__PURE__ */ jsxs("span", {
												className: `inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${log.diff_km > 600 ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"}`,
												children: [
													"+",
													Number(log.diff_km).toFixed(1),
													" KM"
												]
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: log.is_anomaly ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
												children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 mr-1" }), "ANOMALI"]
											}), /* @__PURE__ */ jsx("p", {
												className: "text-[11px] text-rose-600 dark:text-rose-400 mt-1 max-w-xs",
												children: log.anomaly_reason
											})] }) : /* @__PURE__ */ jsxs("span", {
												className: "inline-flex items-center text-xs text-emerald-600 dark:text-emerald-400",
												children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), "Valid & Wajar"]
											})
										})
									]
								}, log.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
									colSpan: "7",
									className: "py-12 text-center text-slate-400 dark:text-slate-500",
									children: "Belum ada histori pencatatan HM/KM sesuai filter yang dipilih."
								}) })
							})]
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: [
								"Menampilkan ",
								logs.data?.length || 0,
								" dari ",
								logs.total || 0,
								" catatan operasional"
							]
						}), /* @__PURE__ */ jsx(Pagination, { links: logs.links })]
					})]
				})] }),
				activeTab === "intervals" && /* @__PURE__ */ jsx("div", {
					className: "space-y-4",
					children: /* @__PURE__ */ jsx("div", {
						className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
						children: serviceIntervals.map((interval) => {
							const isOverdue = interval.status === "overdue";
							const isDueSoon = interval.status === "due_soon";
							const currentHm = Number(interval.unit?.last_hm || 0);
							const lastHm = Number(interval.last_service_hm || 0);
							const nextHm = Number(interval.next_service_hm || 0);
							const totalCycle = nextHm - lastHm || interval.interval_hm;
							const progress = Math.min(100, Math.max(0, (currentHm - lastHm) / totalCycle * 100));
							return /* @__PURE__ */ jsxs(Card, {
								className: `p-4 bg-white dark:bg-slate-800 border-t-4 ${isOverdue ? "border-t-rose-600" : isDueSoon ? "border-t-amber-500" : "border-t-emerald-500"}`,
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex justify-between items-start mb-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
											className: "font-bold text-slate-900 dark:text-white text-base",
											children: interval.unit?.unit_code
										}), /* @__PURE__ */ jsxs("span", {
											className: "text-xs text-slate-500 block",
											children: [
												"Program: ",
												interval.service_type,
												" (",
												interval.interval_hm,
												" HM)"
											]
										})] }), /* @__PURE__ */ jsx("span", {
											className: `px-2 py-0.5 rounded text-[11px] font-bold uppercase ${isOverdue ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse" : isDueSoon ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`,
											children: interval.status.replace("_", " ")
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "my-3 space-y-1.5",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "flex justify-between text-xs",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-slate-500",
													children: "HM Saat Ini:"
												}), /* @__PURE__ */ jsxs("span", {
													className: "font-mono font-bold text-slate-900 dark:text-white",
													children: [currentHm.toLocaleString("id-ID"), " HM"]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex justify-between text-xs",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-slate-500",
													children: "Target Servis:"
												}), /* @__PURE__ */ jsxs("span", {
													className: "font-mono font-bold text-slate-900 dark:text-white",
													children: [nextHm.toLocaleString("id-ID"), " HM"]
												})]
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "flex justify-between text-xs",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-slate-500",
													children: "Sisa Menuju Servis:"
												}), /* @__PURE__ */ jsxs("span", {
													className: `font-mono font-bold ${isOverdue ? "text-rose-600" : isDueSoon ? "text-amber-600" : "text-emerald-600"}`,
													children: [Number(interval.remaining_hm).toFixed(1), " HM"]
												})]
											}),
											/* @__PURE__ */ jsx("div", {
												className: "w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2",
												children: /* @__PURE__ */ jsx("div", {
													className: `h-full transition-all duration-500 ${isOverdue ? "bg-rose-600" : isDueSoon ? "bg-amber-500" : "bg-emerald-500"}`,
													style: { width: `${progress}%` }
												})
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-slate-400",
											children: [
												"Servis terakhir: ",
												lastHm,
												" HM"
											]
										}), isOverdue && /* @__PURE__ */ jsxs("span", {
											className: "text-rose-600 font-bold flex items-center",
											children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 mr-1" }), "Segera Masuk Bengkel"]
										})]
									})
								]
							}, interval.id);
						})
					})
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Pencatatan HM/KM Awal & Akhir Shift",
			maxWidth: "max-w-2xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitLog,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: form.data.unit_id,
								onChange: (e) => handleUnitSelect(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
									value: u.id,
									children: [
										u.unit_code,
										" (HM Terakhir: ",
										u.last_hm,
										")"
									]
								}, u.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Driver Penanggung Jawab"
							}), /* @__PURE__ */ jsxs("select", {
								value: form.data.driver_id,
								onChange: (e) => form.setData("driver_id", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Pilih Driver"
								}), master.drivers?.map((d) => /* @__PURE__ */ jsxs("option", {
									value: d.id,
									children: [
										d.employee?.name,
										" (",
										d.driver_code,
										")"
									]
								}, d.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Shift Kerja *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: form.data.shift_id,
								onChange: (e) => form.setData("shift_id", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: master.shifts?.map((s) => /* @__PURE__ */ jsxs("option", {
									value: s.id,
									children: [
										s.name,
										" (",
										s.code,
										")"
									]
								}, s.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Tanggal Operasi *"
							}), /* @__PURE__ */ jsx("input", {
								type: "date",
								required: true,
								value: form.data.log_date,
								onChange: (e) => form.setData("log_date", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-4",
						children: [
							/* @__PURE__ */ jsx("h4", {
								className: "text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider",
								children: "Pencatatan Jam Mesin (Hour Meter)"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-medium text-slate-500 mb-1",
									children: "HM Awal Shift"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									step: "0.1",
									required: true,
									value: form.data.start_hm,
									onChange: (e) => form.setData("start_hm", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-medium text-slate-500 mb-1",
									children: "HM Akhir Shift"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									step: "0.1",
									required: true,
									value: form.data.end_hm,
									onChange: (e) => form.setData("end_hm", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center text-xs",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500",
									children: "Estimasi Selisih HM Operasi:"
								}), /* @__PURE__ */ jsxs("span", {
									className: `font-mono font-bold text-sm ${Number(calcDeltaHm) > 14 ? "text-rose-600" : "text-cyan-600 dark:text-cyan-400"}`,
									children: [
										"+",
										calcDeltaHm,
										" Jam"
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-4",
						children: [
							/* @__PURE__ */ jsx("h4", {
								className: "text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider",
								children: "Pencatatan Odometer (Kilo Meter)"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-medium text-slate-500 mb-1",
									children: "KM Awal Shift"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									step: "0.1",
									required: true,
									value: form.data.start_km,
									onChange: (e) => form.setData("start_km", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
								})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-medium text-slate-500 mb-1",
									children: "KM Akhir Shift"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									step: "0.1",
									required: true,
									value: form.data.end_km,
									onChange: (e) => form.setData("end_km", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
								})] })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center text-xs",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500",
									children: "Estimasi Selisih Jarak Tempuh:"
								}), /* @__PURE__ */ jsxs("span", {
									className: `font-mono font-bold text-sm ${Number(calcDeltaKm) > 600 ? "text-rose-600" : "text-blue-600 dark:text-blue-400"}`,
									children: [
										"+",
										calcDeltaKm,
										" KM"
									]
								})]
							})
						]
					}),
					isCalculatedAnomaly && /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl flex items-center space-x-2 text-xs text-rose-700 dark:text-rose-300",
						children: [/* @__PURE__ */ jsx(AlertOctagon, { className: "w-5 h-5 flex-shrink-0" }), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("strong", { children: "Perhatian:" }), " Angka yang dimasukkan terdeteksi anomali (> 14 jam atau > 600 KM dalam 1 shift). Sistem akan memberi tanda investigasi pada data ini."] })]
					}),
					isNegativeDelta && /* @__PURE__ */ jsx("div", {
						className: "p-3 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs rounded-lg font-bold",
						children: "Error: Angka Akhir tidak boleh lebih kecil dari Angka Awal!"
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Catatan / Alasan Log"
					}), /* @__PURE__ */ jsx("input", {
						type: "text",
						placeholder: "Contoh: Operasi hauling normal, tidak ada kendala mesin",
						value: form.data.notes,
						onChange: (e) => form.setData("notes", e.target.value),
						className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "primary",
							disabled: form.processing || isNegativeDelta,
							children: form.processing ? "Menyimpan..." : "Simpan Log & Perbarui PM"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Fleet/KPI/Index.jsx
var Index_exports$18 = /* @__PURE__ */ __exportAll({ default: () => FleetKpiIndex });
function FleetKpiIndex({ metrics = {}, formulas = {}, dailyTrends = [], unitBreakdown = [], filters = {}, master = {} }) {
	const [dateFrom, setDateFrom] = useState(filters.date_from || "");
	const [dateTo, setDateTo] = useState(filters.date_to || "");
	const [siteId, setSiteId] = useState(filters.site_id || "");
	const [unitId, setUnitId] = useState(filters.unit_id || "");
	const [isFormulaOpen, setIsFormulaOpen] = useState(true);
	const handleFilter = (e) => {
		e?.preventDefault();
		router.get("/fleet/kpi", {
			date_from: dateFrom,
			date_to: dateTo,
			site_id: siteId,
			unit_id: unitId
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleReset = () => {
		setDateFrom("");
		setDateTo("");
		setSiteId("");
		setUnitId("");
		router.get("/fleet/kpi");
	};
	const getKpiColor = (val, thresholdGood = 85, thresholdWarn = 70) => {
		if (val >= thresholdGood) return "text-emerald-600 dark:text-emerald-400";
		if (val >= thresholdWarn) return "text-amber-600 dark:text-amber-400";
		return "text-rose-600 dark:text-rose-400";
	};
	const getKpiBg = (val, thresholdGood = 85, thresholdWarn = 70) => {
		if (val >= thresholdGood) return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
		if (val >= thresholdWarn) return "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
		return "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [/* @__PURE__ */ jsx(Head, { title: "Fleet KPI Dashboard (PA, MA, UA, MTTR, MTBF) - TAP" }), /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700",
				children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center space-x-3",
					children: [/* @__PURE__ */ jsx("div", {
						className: "p-2.5 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
						children: /* @__PURE__ */ jsx(Activity, { className: "w-6 h-6" })
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
						className: "text-2xl font-bold text-slate-900 dark:text-white",
						children: "Fleet KPI & Availability Dashboard"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm text-slate-500 dark:text-slate-400",
						children: "Analisis kehandalan armada: Physical Availability (PA), Mechanical Availability (MA), Utilization (UA), MTTR & MTBF"
					})] })]
				}) }), /* @__PURE__ */ jsx("div", {
					className: "flex items-center space-x-3 w-full sm:w-auto",
					children: /* @__PURE__ */ jsxs(Button, {
						variant: "secondary",
						onClick: () => router.get("/fleet/kpi"),
						className: "flex items-center space-x-2",
						children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Segarkan" })]
					})
				})]
			}),
			/* @__PURE__ */ jsx(Card, {
				className: "p-5 bg-white dark:bg-slate-800",
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit: handleFilter,
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
							children: "Dari Tanggal"
						}), /* @__PURE__ */ jsx("input", {
							type: "date",
							value: dateFrom,
							onChange: (e) => setDateFrom(e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
							children: "Sampai Tanggal"
						}), /* @__PURE__ */ jsx("input", {
							type: "date",
							value: dateTo,
							onChange: (e) => setDateTo(e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
							children: "Site Proyek"
						}), /* @__PURE__ */ jsxs("select", {
							value: siteId,
							onChange: (e) => setSiteId(e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Semua Site"
							}), master.sites?.map((s) => /* @__PURE__ */ jsxs("option", {
								value: s.id,
								children: [
									s.name,
									" (",
									s.code,
									")"
								]
							}, s.id))]
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
							children: "Pilih Unit Spesifik"
						}), /* @__PURE__ */ jsxs("select", {
							value: unitId,
							onChange: (e) => setUnitId(e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Seluruh Armada Fleet"
							}), master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
								value: u.id,
								children: [
									u.unit_code,
									" - ",
									u.registration_number
								]
							}, u.id))]
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-end space-x-2",
							children: [/* @__PURE__ */ jsxs(Button, {
								type: "submit",
								variant: "primary",
								className: "flex-1 flex items-center justify-center space-x-1",
								children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Filter" })]
							}), /* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "secondary",
								onClick: handleReset,
								children: "Reset"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: `p-6 rounded-2xl border transition-all ${getKpiBg(metrics.physical_availability)}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400",
								children: "Physical Availability (PA)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline space-x-2 mt-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: `text-4xl font-black ${getKpiColor(metrics.physical_availability)}`,
									children: [metrics.physical_availability, "%"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 font-medium",
									children: "Target ≥ 85%"
								})]
							})] }), /* @__PURE__ */ jsx("div", {
								className: "p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm",
								children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-6 h-6 text-emerald-600" })
							})]
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3",
							children: [
								"Tingkat kesiapan fisik unit untuk dioperasikan terhadap seluruh jam kalender (",
								metrics.total_calendar_hours,
								" Jam TH)."
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: `p-6 rounded-2xl border transition-all ${getKpiBg(metrics.mechanical_availability)}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400",
								children: "Mechanical Availability (MA)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline space-x-2 mt-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: `text-4xl font-black ${getKpiColor(metrics.mechanical_availability)}`,
									children: [metrics.mechanical_availability, "%"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 font-medium",
									children: "Target ≥ 90%"
								})]
							})] }), /* @__PURE__ */ jsx("div", {
								className: "p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm",
								children: /* @__PURE__ */ jsx(Wrench, { className: "w-6 h-6 text-amber-600" })
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3",
							children: "Efektivitas mekanikal unit tanpa memperhitungkan idle/standby: OH / (OH + DT)."
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: `p-6 rounded-2xl border transition-all ${getKpiBg(metrics.utilization_ua, 70, 50)}`,
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400",
								children: "Utilization of Availability (UA)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline space-x-2 mt-2",
								children: [/* @__PURE__ */ jsxs("span", {
									className: `text-4xl font-black ${getKpiColor(metrics.utilization_ua, 70, 50)}`,
									children: [metrics.utilization_ua, "%"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 font-medium",
									children: "Target ≥ 70%"
								})]
							})] }), /* @__PURE__ */ jsx("div", {
								className: "p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm",
								children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-6 h-6 text-blue-600" })
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-600 dark:text-slate-300 mt-4 border-t border-slate-200 dark:border-slate-700/60 pt-3",
							children: "Optimalisasi armada siap pakai (RFU) yang benar-benar aktif mengangkut batubara."
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4",
				children: [
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-slate-500 block",
							children: "Calendar Hours (TH)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-slate-900 dark:text-white",
								children: metrics.total_calendar_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-400",
								children: "Jam Total"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-emerald-600 block",
							children: "Operating Hours (OH)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-emerald-600",
								children: metrics.total_operating_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-emerald-500",
								children: "Jam Kerja"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-blue-600 block",
							children: "Standby Hours (SB)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-blue-600",
								children: metrics.total_standby_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-blue-500",
								children: "Jam Idle"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-rose-600 block",
							children: "Downtime Hours (DT)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-rose-600",
								children: metrics.total_downtime_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-rose-500",
								children: "Jam Rusak"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-amber-600 block",
							children: "MTTR (Rata-rata Servis)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-amber-600",
								children: metrics.mttr_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-amber-500",
								children: "Jam/Breakdown"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "p-4 bg-white dark:bg-slate-800",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-xs font-medium text-purple-600 block",
							children: "MTBF (Antar Kerusakan)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between mt-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xl font-black text-purple-600",
								children: metrics.mtbf_hours
							}), /* @__PURE__ */ jsx("span", {
								className: "text-xs text-purple-500",
								children: "Jam/Failure"
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800",
				children: [/* @__PURE__ */ jsxs("div", {
					onClick: () => setIsFormulaOpen(!isFormulaOpen),
					className: "flex justify-between items-center cursor-pointer select-none",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx(Info, { className: "w-5 h-5 text-cyan-400" }), /* @__PURE__ */ jsx("h3", {
							className: "font-bold text-base text-slate-100",
							children: "Definisi Formula & Dasar Perhitungan Ketersediaan Armada Tambang (Explicit Standards)"
						})]
					}), /* @__PURE__ */ jsx("button", {
						className: "text-slate-400 hover:text-white transition",
						children: isFormulaOpen ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5" })
					})]
				}), isFormulaOpen && /* @__PURE__ */ jsxs("div", {
					className: "mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-cyan-400 block text-sm",
									children: "1. Total Calendar Hours (TH)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.calendar_hours
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-slate-400 text-[11px]",
									children: [
										"Dasar waktu absolut 24 jam sehari dikalikan jumlah unit dalam populasi fleet aktif (",
										metrics.fleet_size,
										" Unit × ",
										metrics.days_count,
										" Hari = ",
										metrics.total_calendar_hours,
										" Jam)."
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-emerald-400 block text-sm",
									children: "2. Physical Availability (PA)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.physical_availability
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-400 text-[11px]",
									children: "Pembagi adalah TH (Total Calendar Hours). Menghitung persentase unit berada dalam kondisi siap operasi (RFU = OH + SB) terhadap jam kalender."
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-amber-400 block text-sm",
									children: "3. Mechanical Availability (MA)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.mechanical_availability
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-400 text-[11px]",
									children: "Pembagi adalah OH + DT. Mengabaikan waktu standby (misal hujan, antre, jalan licin), khusus mengukur murni kehandalan teknis mesin dan kecepatan bengkel."
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-blue-400 block text-sm",
									children: "4. Utilization of Availability (UA)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.utilization_ua
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-400 text-[11px]",
									children: "Pembagi adalah Jam RFU (OH + SB). Mengukur seberapa efisien unit yang sehat dan siap jalan benar-benar dioperasikan untuk pengangkutan."
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-purple-400 block text-sm",
									children: "5. MTTR (Mean Time to Repair)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.mttr
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-400 text-[11px]",
									children: "Rata-rata waktu yang dibutuhkan mekanik untuk menyelesaikan satu perbaikan hingga unit kembali RFU."
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 bg-slate-800/80 rounded-xl space-y-1",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "font-bold text-pink-400 block text-sm",
									children: "6. MTBF (Mean Time Between Failures)"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-300 font-mono",
									children: formulas.mtbf
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-slate-400 text-[11px]",
									children: "Rata-rata durasi jam kerja operasi (OH) sebelum unit mengalami kegagalan / breakdown berikutnya."
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6 space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-center",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2",
						children: [/* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Tren Harian Availability Armada (PA, MA, UA)" })]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-slate-500",
						children: "Rentang Periode Terpilih"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left border-collapse text-sm",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tanggal"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Operating (OH)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Standby (SB)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Downtime (DT)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "PA (%)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "MA (%)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "UA (%)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Breakdowns"
								})
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-200 dark:divide-slate-700 text-xs font-mono",
							children: dailyTrends.map((trend, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-700/30",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-sans font-bold text-slate-900 dark:text-white",
										children: trend.date
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-emerald-600 font-bold",
										children: [trend.operating_hours, " Jam"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-blue-600",
										children: [trend.standby_hours, " Jam"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-rose-600",
										children: [trend.downtime_hours, " Jam"]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs("span", {
											className: `px-2 py-0.5 rounded font-bold ${getKpiColor(trend.pa)}`,
											children: [trend.pa, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs("span", {
											className: `px-2 py-0.5 rounded font-bold ${getKpiColor(trend.ma)}`,
											children: [trend.ma, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsxs("span", {
											className: `px-2 py-0.5 rounded font-bold ${getKpiColor(trend.ua, 70, 50)}`,
											children: [trend.ua, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: trend.breakdowns > 0 ? /* @__PURE__ */ jsxs("span", {
											className: "px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold",
											children: [trend.breakdowns, " Kali"]
										}) : /* @__PURE__ */ jsx("span", {
											className: "text-slate-400",
											children: "0"
										})
									})
								]
							}, idx))
						})]
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-6 space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between items-center",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2",
						children: [/* @__PURE__ */ jsx(Truck, { className: "w-5 h-5 text-blue-600" }), /* @__PURE__ */ jsx("span", { children: "Kinerja & Availability Per Armada Unit" })]
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-slate-500",
						children: "Evaluasi Individu Dump Truck"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left border-collapse text-sm",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
							children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Armada"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tipe"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Operating (OH)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Standby (SB)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Downtime (DT)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "PA"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "MA"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "UA"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Breakdown"
								})
							]
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-200 dark:divide-slate-700 text-xs",
							children: unitBreakdown.map((u) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-700/30",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-bold text-slate-900 dark:text-white block",
											children: u.unit_code
										}), /* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-500 font-mono",
											children: u.registration_number
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 capitalize text-slate-700 dark:text-slate-300",
										children: u.unit_type.replace("_", " ")
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4",
										children: /* @__PURE__ */ jsx("span", {
											className: `px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === "operating" ? "bg-emerald-100 text-emerald-800" : u.status === "standby" ? "bg-blue-100 text-blue-800" : u.status === "breakdown" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`,
											children: u.status
										})
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 font-mono font-bold text-emerald-600",
										children: [u.operating_hours, " Jam"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 font-mono text-blue-600",
										children: [u.standby_hours, " Jam"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 font-mono text-rose-600",
										children: [u.downtime_hours, " Jam"]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono font-bold",
										children: /* @__PURE__ */ jsxs("span", {
											className: getKpiColor(u.pa),
											children: [u.pa, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono font-bold",
										children: /* @__PURE__ */ jsxs("span", {
											className: getKpiColor(u.ma),
											children: [u.ma, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono font-bold",
										children: /* @__PURE__ */ jsxs("span", {
											className: getKpiColor(u.ua, 70, 50),
											children: [u.ua, "%"]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono",
										children: u.breakdown_count > 0 ? /* @__PURE__ */ jsxs("span", {
											className: "text-rose-600 font-bold",
											children: [u.breakdown_count, "×"]
										}) : /* @__PURE__ */ jsx("span", {
											className: "text-slate-400",
											children: "0"
										})
									})
								]
							}, u.id))
						})]
					})
				})]
			})
		]
	})] });
}
// resources/js/Pages/Fleet/P2H/Index.jsx
var Index_exports$17 = /* @__PURE__ */ __exportAll({ default: () => DigitalP2hIndex });
var STANDARD_P2H_ITEMS = [
	{
		name: "Engine (Suara & Getaran Mesin)",
		category: "Engine & Fluids",
		is_critical: true
	},
	{
		name: "Oil Level (Oli Mesin, Transmisi & Kebocoran)",
		category: "Engine & Fluids",
		is_critical: true
	},
	{
		name: "Coolant (Air Radiator & Sistem Pendingin)",
		category: "Engine & Fluids",
		is_critical: false
	},
	{
		name: "Brake System (Rem Servis & Rem Parkir)",
		category: "Brake & Steering",
		is_critical: true
	},
	{
		name: "Steering System (Kemudi & Power Steering)",
		category: "Brake & Steering",
		is_critical: true
	},
	{
		name: "Tire Condition & Pressure (Kondisi & Tekanan Ban)",
		category: "Wheels & Tires",
		is_critical: false
	},
	{
		name: "Wheel Nut (Baut & Mur Roda)",
		category: "Wheels & Tires",
		is_critical: true
	},
	{
		name: "Lamps & Rotary (Lampu Kerja, Rem, Sein, Rotari)",
		category: "Electrical & Visibility",
		is_critical: false
	},
	{
		name: "Horn & Backup Alarm (Klakson & Sirine Mundur)",
		category: "Electrical & Visibility",
		is_critical: false
	},
	{
		name: "Mirrors & Glass (Kaca Spion & Kaca Depan)",
		category: "Electrical & Visibility",
		is_critical: false
	},
	{
		name: "Seat Belt (Sabuk Pengaman Driver)",
		category: "Cabin & Safety",
		is_critical: true
	},
	{
		name: "Body & Chassis (Dump Body & Kerangka)",
		category: "Cabin & Safety",
		is_critical: false
	},
	{
		name: "Hydraulic System (Pompa & Silinder Dump)",
		category: "Hydraulic",
		is_critical: true
	},
	{
		name: "Battery (Aki & Terminal Kabel)",
		category: "Electrical & Visibility",
		is_critical: false
	},
	{
		name: "Safety Equipment (APAR, Ganjal Ban, Kotak P3K)",
		category: "Cabin & Safety",
		is_critical: true
	}
];
function DigitalP2hIndex({ inspections = {
	data: [],
	links: []
}, filters = {}, metrics = {}, master = {} }) {
	const [date, setDate] = useState(filters.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [condition, setCondition] = useState(filters.condition || "");
	const [unitId, setUnitId] = useState(filters.unit_id || "");
	const [shiftId, setShiftId] = useState(filters.shift_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [selectedInspection, setSelectedInspection] = useState(null);
	const initialItems = STANDARD_P2H_ITEMS.map((item) => ({
		item_name: item.name,
		category: item.category,
		is_critical: item.is_critical,
		status: "good",
		defect_description: "",
		photo_path: ""
	}));
	const form = useForm({
		unit_id: master.units?.[0]?.id || "",
		driver_id: master.drivers?.[0]?.id || "",
		shift_id: master.shifts?.[0]?.id || "",
		inspection_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		inspection_time: (/* @__PURE__ */ new Date()).toTimeString().split(" ")[0].substring(0, 5),
		current_hm: master.units?.[0]?.last_hm || 0,
		current_km: master.units?.[0]?.last_km || 0,
		driver_notes: "",
		items: initialItems
	});
	const handleFilter = (e) => {
		e?.preventDefault();
		router.get("/fleet/p2h", {
			date,
			condition,
			unit_id: unitId,
			shift_id: shiftId
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleReset = () => {
		setDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
		setCondition("");
		setUnitId("");
		setShiftId("");
		router.get("/fleet/p2h");
	};
	const handleUnitSelect = (id) => {
		const u = master.units?.find((item) => item.id == id);
		form.setData({
			...form.data,
			unit_id: id,
			current_hm: u?.last_hm || 0,
			current_km: u?.last_km || 0
		});
	};
	const handleItemStatusChange = (index, status) => {
		const newItems = [...form.data.items];
		newItems[index].status = status;
		if (status === "good") newItems[index].defect_description = "";
		form.setData("items", newItems);
	};
	const handleItemDefectChange = (index, desc) => {
		const newItems = [...form.data.items];
		newItems[index].defect_description = desc;
		form.setData("items", newItems);
	};
	const hasCriticalDefect = form.data.items.some((it) => it.is_critical && it.status === "not_good");
	form.data.items.some((it) => !it.is_critical && it.status === "not_good");
	const submitP2h = (e) => {
		e.preventDefault();
		form.post("/fleet/p2h", { onSuccess: () => {
			form.reset();
			setIsCreateOpen(false);
		} });
	};
	const openDetail = (insp) => {
		setSelectedInspection(insp);
		setIsDetailOpen(true);
	};
	const getConditionBadge = (cond) => {
		switch (cond) {
			case "rfu": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
				children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), "SIAP OPERASI (RFU)"]
			});
			case "rfu_with_notes": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
				children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 mr-1" }), "RFU DENGAN CATATAN"]
			});
			case "not_rfu": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse",
				children: [/* @__PURE__ */ jsx(AlertOctagon, { className: "w-3.5 h-3.5 mr-1" }), "TIDAK SIAP (NOT RFU)"]
			});
			default: return /* @__PURE__ */ jsx("span", { children: cond });
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Digital P2H - Pemeriksaan Pra-Operasi Harian - TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
							children: /* @__PURE__ */ jsx(ClipboardCheck, { className: "w-6 h-6" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold text-slate-900 dark:text-white",
							children: "Digital P2H (Pemeriksaan Pra-Operasi Harian)"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-500 dark:text-slate-400",
							children: "Checklist keselamatan 15 item pra-shift, deteksi kegagalan kritis, dan integrasi otomatis ke Maintenance Work Order"
						})] })]
					}) }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3 w-full sm:w-auto",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "secondary",
							onClick: () => router.get("/fleet/p2h"),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Segarkan" })]
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "primary",
							onClick: () => setIsCreateOpen(true),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Isi Form P2H Baru" })]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-5 gap-4",
					children: [
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Total Inspeksi"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: metrics.total || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Hari ini"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider",
								children: "Lolos RFU"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-emerald-600 dark:text-emerald-400",
									children: metrics.rfu || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-emerald-600/80",
									children: "Kondisi Baik"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider",
								children: "RFU Catatan"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-amber-600 dark:text-amber-400",
									children: metrics.rfu_with_notes || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-amber-500",
									children: "Minor Defect"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider",
								children: "Not RFU"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-600 dark:text-rose-400",
									children: metrics.not_rfu || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Dilarang Jalan"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-700",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider",
								children: "Cacat Kritis"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-700 dark:text-rose-400",
									children: metrics.critical_defects || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Auto WO"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx(Card, {
					className: "p-5 bg-white dark:bg-slate-800",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: handleFilter,
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Tanggal Inspeksi"
							}), /* @__PURE__ */ jsx("input", {
								type: "date",
								value: date,
								onChange: (e) => setDate(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Hasil Kelayakan"
							}), /* @__PURE__ */ jsxs("select", {
								value: condition,
								onChange: (e) => setCondition(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Semua Hasil"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "rfu",
										children: "Lolos Siap Operasi (RFU)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "rfu_with_notes",
										children: "RFU dengan Catatan"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "not_rfu",
										children: "Tidak Siap Operasi (NOT RFU)"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit"
							}), /* @__PURE__ */ jsxs("select", {
								value: unitId,
								onChange: (e) => setUnitId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Unit"
								}), master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
									value: u.id,
									children: [
										u.unit_code,
										" (",
										u.unit_type,
										")"
									]
								}, u.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Shift Kerja"
							}), /* @__PURE__ */ jsxs("select", {
								value: shiftId,
								onChange: (e) => setShiftId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Shift"
								}), master.shifts?.map((s) => /* @__PURE__ */ jsxs("option", {
									value: s.id,
									children: [
										s.name,
										" (",
										s.code,
										")"
									]
								}, s.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end space-x-2",
								children: [/* @__PURE__ */ jsxs(Button, {
									type: "submit",
									variant: "primary",
									className: "flex-1 flex items-center justify-center space-x-1",
									children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Filter" })]
								}), /* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "secondary",
									onClick: handleReset,
									children: "Reset"
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse text-sm",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "No. P2H & Waktu"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Armada & HM/KM"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Driver Penguji"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Shift"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Kondisi Kelayakan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Status Work Order"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-200 dark:divide-slate-700",
								children: inspections.data?.length > 0 ? inspections.data.map((insp) => /* @__PURE__ */ jsxs("tr", {
									className: "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors",
									children: [
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [/* @__PURE__ */ jsx("div", {
												className: "font-mono font-bold text-slate-900 dark:text-white",
												children: insp.inspection_number
											}), /* @__PURE__ */ jsxs("div", {
												className: "text-xs text-slate-500 dark:text-slate-400",
												children: [
													insp.inspection_date,
													" • ",
													insp.inspection_time,
													" WITA"
												]
											})]
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "font-bold text-slate-900 dark:text-white flex items-center space-x-1.5",
												children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: insp.unit?.unit_code })]
											}), /* @__PURE__ */ jsxs("div", {
												className: "text-xs text-slate-500 dark:text-slate-400 font-mono",
												children: [
													Number(insp.current_hm).toLocaleString("id-ID"),
													" HM • ",
													Number(insp.current_km).toLocaleString("id-ID"),
													" KM"
												]
											})]
										}),
										/* @__PURE__ */ jsxs("td", {
											className: "py-3.5 px-4",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "text-slate-900 dark:text-white font-medium flex items-center space-x-1.5",
												children: [/* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-blue-500" }), /* @__PURE__ */ jsx("span", { children: insp.driver?.employee?.name || "-" })]
											}), /* @__PURE__ */ jsx("div", {
												className: "text-xs font-mono text-slate-400",
												children: insp.driver?.driver_code
											})]
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: /* @__PURE__ */ jsx("span", {
												className: "px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
												children: insp.shift?.name || "-"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: getConditionBadge(insp.overall_condition)
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4",
											children: insp.work_order ? /* @__PURE__ */ jsxs("div", {
												className: "inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-1 rounded-lg",
												children: [/* @__PURE__ */ jsx(Wrench, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsxs("span", { children: [
													insp.work_order.wo_number,
													" (",
													insp.work_order.status,
													")"
												] })]
											}) : /* @__PURE__ */ jsx("span", {
												className: "text-xs text-slate-400",
												children: "Tidak ada kerusakan"
											})
										}),
										/* @__PURE__ */ jsx("td", {
											className: "py-3.5 px-4 text-right",
											children: /* @__PURE__ */ jsxs(Button, {
												size: "sm",
												variant: "secondary",
												onClick: () => openDetail(insp),
												className: "inline-flex items-center space-x-1",
												children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: "Lihat Form" })]
											})
										})
									]
								}, insp.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
									colSpan: "7",
									className: "py-12 text-center text-slate-400 dark:text-slate-500",
									children: "Belum ada data pemeriksaan P2H pada tanggal dan filter yang dipilih."
								}) })
							})]
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: [
								"Menampilkan ",
								inspections.data?.length || 0,
								" dari ",
								inspections.total || 0,
								" lembar P2H"
							]
						}), /* @__PURE__ */ jsx(Pagination, { links: inspections.links })]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Form Pemeriksaan Pra-Operasi Harian (Digital P2H)",
			maxWidth: "max-w-4xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitP2h,
				className: "space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: form.data.unit_id,
								onChange: (e) => handleUnitSelect(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
								children: master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
									value: u.id,
									children: [
										u.unit_code,
										" - ",
										u.unit_type,
										" (HM: ",
										u.last_hm,
										")"
									]
								}, u.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Driver Penguji *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: form.data.driver_id,
								onChange: (e) => form.setData("driver_id", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
								children: master.drivers?.map((d) => /* @__PURE__ */ jsxs("option", {
									value: d.id,
									children: [
										d.employee?.name,
										" (",
										d.driver_code,
										")"
									]
								}, d.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Shift Kerja *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: form.data.shift_id,
								onChange: (e) => form.setData("shift_id", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white",
								children: master.shifts?.map((s) => /* @__PURE__ */ jsxs("option", {
									value: s.id,
									children: [
										s.name,
										" (",
										s.code,
										")"
									]
								}, s.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Waktu Inspeksi"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex space-x-1",
								children: [/* @__PURE__ */ jsx("input", {
									type: "date",
									required: true,
									value: form.data.inspection_date,
									onChange: (e) => form.setData("inspection_date", e.target.value),
									className: "w-2/3 px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
								}), /* @__PURE__ */ jsx("input", {
									type: "time",
									required: true,
									value: form.data.inspection_time,
									onChange: (e) => form.setData("inspection_time", e.target.value),
									className: "w-1/3 px-1 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Hour Meter (HM) Saat Ini *"
							}), /* @__PURE__ */ jsx("input", {
								type: "number",
								step: "0.1",
								required: true,
								value: form.data.current_hm,
								onChange: (e) => form.setData("current_hm", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Kilo Meter (KM) Saat Ini *"
							}), /* @__PURE__ */ jsx("input", {
								type: "number",
								step: "0.1",
								required: true,
								value: form.data.current_km,
								onChange: (e) => form.setData("current_km", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
									children: "Catatan Tambahan Driver"
								}), /* @__PURE__ */ jsx("input", {
									type: "text",
									placeholder: "Contoh: Bunyi decit halus pada rem kanan belakang",
									value: form.data.driver_notes,
									onChange: (e) => form.setData("driver_notes", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
								})]
							})
						]
					}),
					hasCriticalDefect && /* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 rounded-xl flex items-start space-x-3 text-rose-900 dark:text-rose-200 animate-pulse",
						children: [/* @__PURE__ */ jsx(AlertOctagon, { className: "w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
							className: "font-bold text-sm",
							children: "PERINGATAN KESELAMATAN KRITIS (SOP K3LH TAP)"
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs mt-1",
							children: [
								"Item bertanda ",
								/* @__PURE__ */ jsx("strong", { children: "KRITIS" }),
								" dinyatakan Rusak (Not Good). Berdasarkan standar operasional tambang, armada ini ",
								/* @__PURE__ */ jsx("strong", { children: "TIDAK DAPAT DIJALANKAN (NOT RFU)" }),
								". Sistem akan secara otomatis mengunci status armada ke ",
								/* @__PURE__ */ jsx("strong", { children: "BREAKDOWN" }),
								" dan menerbitkan Work Order langsung ke divisi Maintenance."
							]
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-center",
							children: [/* @__PURE__ */ jsxs("h3", {
								className: "text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2",
								children: [/* @__PURE__ */ jsx(ClipboardCheck, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: "Checklist Pemeriksaan 15 Item Wajib" })]
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xs text-slate-500",
								children: [form.data.items.filter((i) => i.status === "good").length, "/15 Baik"]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700",
							children: form.data.items.map((item, idx) => /* @__PURE__ */ jsxs("div", {
								className: `p-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${item.status === "not_good" ? item.is_critical ? "bg-rose-50/70 dark:bg-rose-950/20" : "bg-amber-50/70 dark:bg-amber-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`,
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center space-x-2",
											children: [/* @__PURE__ */ jsxs("span", {
												className: "font-semibold text-slate-900 dark:text-white",
												children: [
													idx + 1,
													". ",
													item.item_name
												]
											}), item.is_critical && /* @__PURE__ */ jsx("span", {
												className: "px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase",
												children: "KRITIS"
											})]
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-[11px] text-slate-400 block",
											children: item.category
										}),
										item.status === "not_good" && /* @__PURE__ */ jsx("div", {
											className: "mt-2",
											children: /* @__PURE__ */ jsx("input", {
												type: "text",
												required: true,
												placeholder: "Deskripsikan kerusakan / temuan...",
												value: item.defect_description,
												onChange: (e) => handleItemDefectChange(idx, e.target.value),
												className: "w-full px-2.5 py-1.5 text-xs rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
											})
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center space-x-2",
									children: [
										/* @__PURE__ */ jsxs("label", {
											className: `px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${item.status === "good" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
											children: [/* @__PURE__ */ jsx("input", {
												type: "radio",
												name: `item_${idx}`,
												className: "hidden",
												checked: item.status === "good",
												onChange: () => handleItemStatusChange(idx, "good")
											}), /* @__PURE__ */ jsx("span", { children: "Good" })]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: `px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${item.status === "not_good" ? "bg-rose-600 text-white border-rose-600" : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
											children: [/* @__PURE__ */ jsx("input", {
												type: "radio",
												name: `item_${idx}`,
												className: "hidden",
												checked: item.status === "not_good",
												onChange: () => handleItemStatusChange(idx, "not_good")
											}), /* @__PURE__ */ jsx("span", { children: "Not Good" })]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: `px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition flex items-center space-x-1 ${item.status === "not_applicable" ? "bg-slate-600 text-white border-slate-600" : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,
											children: [/* @__PURE__ */ jsx("input", {
												type: "radio",
												name: `item_${idx}`,
												className: "hidden",
												checked: item.status === "not_applicable",
												onChange: () => handleItemStatusChange(idx, "not_applicable")
											}), /* @__PURE__ */ jsx("span", { children: "N/A" })]
										})
									]
								})]
							}, idx))
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-600 flex-shrink-0" }), /* @__PURE__ */ jsx("div", {
							className: "text-xs text-slate-700 dark:text-slate-300",
							children: "Dengan mengklik tombol submit, saya menyatakan telah melakukan pemeriksaan fisik menyeluruh terhadap armada ini secara jujur dan bertanggung jawab sesuai SOP K3LH PT Teknindo Adhya Pane. Hash tanda tangan digital akan dicatat secara kriptografis."
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: hasCriticalDefect ? "danger" : "primary",
							disabled: form.processing,
							children: form.processing ? "Menyimpan & Menandatangani..." : hasCriticalDefect ? "Laporkan Cacat Kritis & Kirim WO" : "Kirim Form P2H Selesai"
						})]
					})
				]
			})
		}),
		selectedInspection && /* @__PURE__ */ jsx(Modal, {
			isOpen: isDetailOpen,
			onClose: () => setIsDetailOpen(false),
			title: `Lembar Pemeriksaan P2H: ${selectedInspection.inspection_number}`,
			maxWidth: "max-w-3xl",
			children: /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-slate-50 dark:bg-slate-900 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Unit Armada"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-900 dark:text-white text-sm",
								children: selectedInspection.unit?.unit_code
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Driver Penguji"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-900 dark:text-white text-sm",
								children: selectedInspection.driver?.employee?.name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Tanggal & Waktu"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-medium text-slate-900 dark:text-white",
								children: [
									selectedInspection.inspection_date,
									" ",
									selectedInspection.inspection_time
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Shift Kerja"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-slate-900 dark:text-white",
								children: selectedInspection.shift?.name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Hour Meter (HM)"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono font-bold text-slate-900 dark:text-white",
								children: [Number(selectedInspection.current_hm).toLocaleString("id-ID"), " HM"]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Kilo Meter (KM)"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono font-bold text-slate-900 dark:text-white",
								children: [Number(selectedInspection.current_km).toLocaleString("id-ID"), " KM"]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500 block",
									children: "Hasil Kelayakan"
								}), /* @__PURE__ */ jsx("div", { children: getConditionBadge(selectedInspection.overall_condition) })]
							})
						]
					}),
					selectedInspection.work_order && /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl text-xs",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "font-bold text-rose-800 dark:text-rose-300 block mb-1",
							children: ["Work Order Otomatis: ", selectedInspection.work_order.wo_number]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-rose-700 dark:text-rose-400",
							children: selectedInspection.work_order.defect_summary
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700 max-h-80 overflow-y-auto",
						children: selectedInspection.items?.map((item, idx) => /* @__PURE__ */ jsxs("div", {
							className: "p-3 text-xs flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("span", {
								className: "font-semibold text-slate-900 dark:text-white block",
								children: [
									idx + 1,
									". ",
									item.item_name,
									" ",
									item.is_critical && /* @__PURE__ */ jsx("span", {
										className: "text-rose-500 font-bold",
										children: "(Kritis)"
									})
								]
							}), item.defect_description && /* @__PURE__ */ jsxs("span", {
								className: "text-rose-600 dark:text-rose-400 italic",
								children: ["Temuan: ", item.defect_description]
							})] }), /* @__PURE__ */ jsx("span", {
								className: `px-2 py-0.5 rounded font-bold uppercase text-[10px] ${item.status === "good" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : item.status === "not_good" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`,
								children: item.status.replace("_", " ")
							})]
						}, idx))
					}),
					selectedInspection.driver_signature_hash && /* @__PURE__ */ jsxs("div", {
						className: "p-2.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-[11px] font-mono text-slate-500 break-all",
						children: ["Digital Signature Hash: ", selectedInspection.driver_signature_hash]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							onClick: () => setIsDetailOpen(false),
							children: "Tutup"
						})
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Fleet/Registry/Index.jsx
var Index_exports$16 = /* @__PURE__ */ __exportAll({ default: () => FleetRegistryIndex });
function FleetRegistryIndex({ units = {
	data: [],
	links: []
}, filters = {}, summary = {}, master = {} }) {
	const [search, setSearch] = useState(filters.search || "");
	const [status, setStatus] = useState(filters.status || "");
	const [unitType, setUnitType] = useState(filters.unit_type || "");
	const [siteId, setSiteId] = useState(filters.site_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [selectedUnit, setSelectedUnit] = useState(null);
	const createForm = useForm({
		unit_code: "",
		registration_number: "",
		unit_type: "dump_truck_10",
		brand: "Hino",
		model: "FM 260 JD",
		year: (/* @__PURE__ */ new Date()).getFullYear(),
		capacity_ton: 25,
		capacity_m3: 18,
		chassis_number: "",
		engine_number: "",
		last_hm: 0,
		last_km: 0,
		status: "standby",
		site_id: master.sites?.[0]?.id || "",
		vendor_id: master.vendors?.[0]?.id || "",
		operation_start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
	});
	const editForm = useForm({
		registration_number: "",
		unit_type: "",
		brand: "",
		model: "",
		year: "",
		capacity_ton: "",
		capacity_m3: "",
		chassis_number: "",
		engine_number: "",
		last_hm: "",
		last_km: "",
		status: "",
		site_id: "",
		vendor_id: ""
	});
	const statusForm = useForm({ status: "standby" });
	const handleFilter = (e) => {
		e?.preventDefault();
		router.get("/fleet/registry", {
			search,
			status,
			unit_type: unitType,
			site_id: siteId
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleReset = () => {
		setSearch("");
		setStatus("");
		setUnitType("");
		setSiteId("");
		router.get("/fleet/registry");
	};
	const handleOpenEdit = (unit) => {
		setSelectedUnit(unit);
		editForm.setData({
			registration_number: unit.registration_number,
			unit_type: unit.unit_type,
			brand: unit.brand,
			model: unit.model || "",
			year: unit.year || "",
			capacity_ton: unit.capacity_ton,
			capacity_m3: unit.capacity_m3 || "",
			chassis_number: unit.chassis_number || "",
			engine_number: unit.engine_number || "",
			last_hm: unit.last_hm,
			last_km: unit.last_km,
			status: unit.status,
			site_id: unit.site_id,
			vendor_id: unit.vendor_id || ""
		});
		setIsEditOpen(true);
	};
	const handleOpenStatus = (unit) => {
		setSelectedUnit(unit);
		statusForm.setData("status", unit.status);
		setIsStatusOpen(true);
	};
	const handleOpenDetail = (unit) => {
		setSelectedUnit(unit);
		setIsDetailOpen(true);
	};
	const submitCreate = (e) => {
		e.preventDefault();
		createForm.post("/fleet/registry", { onSuccess: () => {
			createForm.reset();
			setIsCreateOpen(false);
		} });
	};
	const submitEdit = (e) => {
		e.preventDefault();
		editForm.put(`/fleet/registry/${selectedUnit.id}`, { onSuccess: () => {
			setIsEditOpen(false);
		} });
	};
	const submitStatus = (e) => {
		e.preventDefault();
		statusForm.put(`/fleet/registry/${selectedUnit.id}/status`, { onSuccess: () => {
			setIsStatusOpen(false);
		} });
	};
	const getStatusBadge = (unitStatus) => {
		switch (unitStatus) {
			case "operating": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500" }), "Operating"]
			});
			case "standby": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500" }), "Standby RFU"]
			});
			case "breakdown": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" }), "Breakdown"]
			});
			case "maintenance": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" }), "Maintenance"]
			});
			default: return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
				children: unitStatus
			});
		}
	};
	const formatUnitType = (type) => {
		return {
			dump_truck_10: "DT 10 Roda",
			dump_truck_12: "DT 12 Roda",
			light_vehicle: "Light Vehicle (LV)",
			fuel_truck: "Fuel Truck",
			service_truck: "Service Truck",
			support_equipment: "Support Equipment"
		}[type] || type;
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Unit Registry & Fleet Status Monitoring - TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
							children: /* @__PURE__ */ jsx(Truck, { className: "w-6 h-6" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold text-slate-900 dark:text-white",
							children: "Unit Registry & Fleet Status"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-500 dark:text-slate-400",
							children: "Registrasi seluruh unit dump truck, armada pendukung, dan pemantauan status RFU real-time"
						})] })]
					}) }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3 w-full sm:w-auto",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "secondary",
							onClick: () => router.get("/fleet/registry"),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Segarkan" })]
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "primary",
							onClick: () => setIsCreateOpen(true),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Registrasi Unit Baru" })]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4",
					children: [
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Total Armada"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: summary.total || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Unit"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider",
								children: "Ready (RFU)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-emerald-600 dark:text-emerald-400",
									children: summary.rfu_ready || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-emerald-600/80",
									children: "Siap Jalan"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-400",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Operating"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: summary.operating || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Hauling"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Standby"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: summary.standby || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "Siaga"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider",
								children: "Breakdown"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-600 dark:text-rose-400",
									children: summary.breakdown || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Kritis"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider",
								children: "Maintenance"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-amber-600 dark:text-amber-400",
									children: summary.maintenance || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-amber-500",
									children: "Workshop"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx(Card, {
					className: "p-5 bg-white dark:bg-slate-800",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: handleFilter,
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Cari Armada"
							}), /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 absolute left-3 top-3 text-slate-400" }), /* @__PURE__ */ jsx("input", {
									type: "text",
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "No. Lambung / Plat / Seri...",
									className: "w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Status Operasi"
							}), /* @__PURE__ */ jsxs("select", {
								value: status,
								onChange: (e) => setStatus(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Semua Status"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "operating",
										children: "Operating"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "standby",
										children: "Standby (RFU)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "breakdown",
										children: "Breakdown"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "maintenance",
										children: "Maintenance"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Jenis Unit"
							}), /* @__PURE__ */ jsxs("select", {
								value: unitType,
								onChange: (e) => setUnitType(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Semua Tipe"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "dump_truck_10",
										children: "Dump Truck 10 Roda"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "dump_truck_12",
										children: "Dump Truck 12 Roda"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "light_vehicle",
										children: "Light Vehicle"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "fuel_truck",
										children: "Fuel Truck"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "service_truck",
										children: "Service Truck"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "support_equipment",
										children: "Support Equipment"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Site Proyek"
							}), /* @__PURE__ */ jsxs("select", {
								value: siteId,
								onChange: (e) => setSiteId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Site"
								}), master.sites?.map((s) => /* @__PURE__ */ jsxs("option", {
									value: s.id,
									children: [
										s.name,
										" (",
										s.code,
										")"
									]
								}, s.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end space-x-2",
								children: [/* @__PURE__ */ jsxs(Button, {
									type: "submit",
									variant: "primary",
									className: "flex-1 flex items-center justify-center space-x-1",
									children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Filter" })]
								}), /* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "secondary",
									onClick: handleReset,
									children: "Reset"
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse text-sm",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "No. Lambung & Plat"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Tipe & Spesifikasi"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Kapasitas"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "HM & KM Terakhir"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Status & RFU"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "P2H Terakhir"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-200 dark:divide-slate-700",
								children: units.data?.length > 0 ? units.data.map((unit) => {
									const isRfu = (unit.status === "operating" || unit.status === "standby") && !unit.active_work_order;
									return /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ jsxs("div", {
													className: "flex items-center space-x-3",
													children: [/* @__PURE__ */ jsx("div", {
														className: "w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200",
														children: /* @__PURE__ */ jsx(Truck, { className: "w-5 h-5 text-emerald-600" })
													}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
														className: "font-bold text-slate-900 dark:text-white block text-base",
														children: unit.unit_code
													}), /* @__PURE__ */ jsx("span", {
														className: "text-xs font-mono text-slate-500 dark:text-slate-400",
														children: unit.registration_number
													})] })]
												})
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsx("div", {
													className: "text-slate-900 dark:text-white font-medium",
													children: formatUnitType(unit.unit_type)
												}), /* @__PURE__ */ jsxs("div", {
													className: "text-xs text-slate-500 dark:text-slate-400",
													children: [
														unit.brand,
														" ",
														unit.model,
														" (",
														unit.year || "-",
														")"
													]
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "font-semibold text-slate-900 dark:text-white",
													children: [
														unit.capacity_ton,
														" ",
														/* @__PURE__ */ jsx("span", {
															className: "text-xs font-normal text-slate-500",
															children: "Ton"
														})
													]
												}), unit.capacity_m3 && /* @__PURE__ */ jsxs("div", {
													className: "text-xs text-slate-500 dark:text-slate-400",
													children: [unit.capacity_m3, " m³"]
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "text-slate-900 dark:text-white font-mono font-medium",
													children: [
														Number(unit.last_hm).toLocaleString("id-ID"),
														" ",
														/* @__PURE__ */ jsx("span", {
															className: "text-xs font-sans text-slate-500",
															children: "HM"
														})
													]
												}), /* @__PURE__ */ jsxs("div", {
													className: "text-xs font-mono text-slate-500 dark:text-slate-400",
													children: [Number(unit.last_km).toLocaleString("id-ID"), " KM"]
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ jsxs("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ jsx("div", { children: getStatusBadge(unit.status) }), /* @__PURE__ */ jsx("div", { children: isRfu ? /* @__PURE__ */ jsxs("span", {
														className: "inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400",
														children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), "RFU Verified"]
													}) : /* @__PURE__ */ jsxs("span", {
														className: "inline-flex items-center text-xs font-medium text-rose-600 dark:text-rose-400",
														children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3.5 h-3.5 mr-1" }), "Not RFU"]
													}) })]
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: unit.latest_p2h ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
													className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${unit.latest_p2h.overall_condition === "rfu" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : unit.latest_p2h.overall_condition === "rfu_with_notes" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold"}`,
													children: unit.latest_p2h.overall_condition.toUpperCase()
												}), /* @__PURE__ */ jsx("div", {
													className: "text-[11px] text-slate-500 dark:text-slate-400 mt-0.5",
													children: unit.latest_p2h.inspection_date
												})] }) : /* @__PURE__ */ jsx("span", {
													className: "text-xs text-slate-400 italic",
													children: "Belum Ada P2H"
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-right",
												children: /* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-end space-x-1.5",
													children: [
														/* @__PURE__ */ jsx("button", {
															onClick: () => handleOpenDetail(unit),
															className: "p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition",
															title: "Detail Armada",
															children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
														}),
														/* @__PURE__ */ jsx("button", {
															onClick: () => handleOpenStatus(unit),
															className: "p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition",
															title: "Ubah Status",
															children: /* @__PURE__ */ jsx(Activity, { className: "w-4 h-4" })
														}),
														/* @__PURE__ */ jsx("button", {
															onClick: () => handleOpenEdit(unit),
															className: "p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition",
															title: "Edit Spesifikasi",
															children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
														})
													]
												})
											})
										]
									}, unit.id);
								}) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
									colSpan: "7",
									className: "py-12 text-center text-slate-400 dark:text-slate-500",
									children: "Tidak ada unit yang sesuai dengan kriteria filter."
								}) })
							})]
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: [
								"Menampilkan ",
								units.data?.length || 0,
								" unit dari ",
								units.total || 0,
								" armada terdaftar"
							]
						}), /* @__PURE__ */ jsx(Pagination, { links: units.links })]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Registrasi Unit Armada Baru",
			maxWidth: "max-w-3xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitCreate,
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Nomor Lambung (Unit Code) *"
							}),
							/* @__PURE__ */ jsx("input", {
								type: "text",
								required: true,
								placeholder: "Contoh: DT-201",
								value: createForm.data.unit_code,
								onChange: (e) => createForm.setData("unit_code", e.target.value.toUpperCase()),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							}),
							createForm.errors.unit_code && /* @__PURE__ */ jsx("p", {
								className: "text-xs text-rose-500 mt-1",
								children: createForm.errors.unit_code
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Nomor Polisi (Plat) *"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							required: true,
							placeholder: "Contoh: KT 8234 TAP",
							value: createForm.data.registration_number,
							onChange: (e) => createForm.setData("registration_number", e.target.value.toUpperCase()),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Jenis Armada *"
						}), /* @__PURE__ */ jsxs("select", {
							value: createForm.data.unit_type,
							onChange: (e) => createForm.setData("unit_type", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "dump_truck_10",
									children: "Dump Truck 10 Roda"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "dump_truck_12",
									children: "Dump Truck 12 Roda"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "light_vehicle",
									children: "Light Vehicle (LV)"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "fuel_truck",
									children: "Fuel Truck"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "service_truck",
									children: "Service Truck"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "support_equipment",
									children: "Support Equipment"
								})
							]
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Merek (Brand) *"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							required: true,
							placeholder: "Hino / Scania / Volvo / Mitsubishi",
							value: createForm.data.brand,
							onChange: (e) => createForm.setData("brand", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Model / Tipe Seri"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							placeholder: "FM 260 JD / FMX 440",
							value: createForm.data.model,
							onChange: (e) => createForm.setData("model", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Tahun Pembuatan"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							placeholder: "2024",
							value: createForm.data.year,
							onChange: (e) => createForm.setData("year", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Kapasitas Angkut (Ton) *"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: createForm.data.capacity_ton,
							onChange: (e) => createForm.setData("capacity_ton", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Kapasitas Bak (m³)"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							value: createForm.data.capacity_m3,
							onChange: (e) => createForm.setData("capacity_m3", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Hour Meter (HM) Awal *"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: createForm.data.last_hm,
							onChange: (e) => createForm.setData("last_hm", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Kilo Meter (KM) Awal *"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: createForm.data.last_km,
							onChange: (e) => createForm.setData("last_km", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Site Proyek *"
						}), /* @__PURE__ */ jsx("select", {
							required: true,
							value: createForm.data.site_id,
							onChange: (e) => createForm.setData("site_id", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
							children: master.sites?.map((s) => /* @__PURE__ */ jsxs("option", {
								value: s.id,
								children: [
									s.name,
									" (",
									s.code,
									")"
								]
							}, s.id))
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Vendor / Kepemilikan"
						}), /* @__PURE__ */ jsxs("select", {
							value: createForm.data.vendor_id,
							onChange: (e) => createForm.setData("vendor_id", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Internal TAP"
							}), master.vendors?.map((v) => /* @__PURE__ */ jsx("option", {
								value: v.id,
								children: v.name
							}, v.id))]
						})] })
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => setIsCreateOpen(false),
						children: "Batal"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						variant: "primary",
						disabled: createForm.processing,
						children: createForm.processing ? "Menyimpan..." : "Simpan & Daftarkan Unit"
					})]
				})]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isEditOpen,
			onClose: () => setIsEditOpen(false),
			title: `Edit Spesifikasi Armada: ${selectedUnit?.unit_code}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitEdit,
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Nomor Polisi (Plat)"
						}), /* @__PURE__ */ jsx("input", {
							type: "text",
							required: true,
							value: editForm.data.registration_number,
							onChange: (e) => editForm.setData("registration_number", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Kapasitas (Ton)"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: editForm.data.capacity_ton,
							onChange: (e) => editForm.setData("capacity_ton", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Hour Meter (HM)"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: editForm.data.last_hm,
							onChange: (e) => editForm.setData("last_hm", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Kilo Meter (KM)"
						}), /* @__PURE__ */ jsx("input", {
							type: "number",
							step: "0.1",
							required: true,
							value: editForm.data.last_km,
							onChange: (e) => editForm.setData("last_km", e.target.value),
							className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
						})] })
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => setIsEditOpen(false),
						children: "Batal"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						variant: "primary",
						disabled: editForm.processing,
						children: editForm.processing ? "Menyimpan..." : "Perbarui Spesifikasi"
					})]
				})]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isStatusOpen,
			onClose: () => setIsStatusOpen(false),
			title: `Ubah Status Armada: ${selectedUnit?.unit_code}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitStatus,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "text-sm text-slate-600 dark:text-slate-300",
						children: [
							"Pilih status operasional terkini untuk unit ",
							/* @__PURE__ */ jsx("strong", { children: selectedUnit?.unit_code }),
							" (",
							selectedUnit?.registration_number,
							"):"
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: [
							"operating",
							"standby",
							"breakdown",
							"maintenance"
						].map((st) => /* @__PURE__ */ jsxs("label", {
							className: `flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${statusForm.data.status === st ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`,
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center space-x-3",
								children: [/* @__PURE__ */ jsx("input", {
									type: "radio",
									name: "status",
									value: st,
									checked: statusForm.data.status === st,
									onChange: () => statusForm.setData("status", st),
									className: "text-emerald-600 focus:ring-emerald-500"
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-900 dark:text-white capitalize block",
									children: st
								}), /* @__PURE__ */ jsxs("span", {
									className: "text-xs text-slate-500 dark:text-slate-400",
									children: [
										st === "operating" && "Unit sedang berjalan beroperasi hauling batubara.",
										st === "standby" && "Unit siap operasi (RFU) namun idle / antre / pergantian shift.",
										st === "breakdown" && "Unit mengalami kerusakan mendadak di jalan / pit / tambang.",
										st === "maintenance" && "Unit sedang berada di bengkel/workshop untuk perbaikan/PM."
									]
								})] })]
							}), getStatusBadge(st)]
						}, st))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsStatusOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "primary",
							disabled: statusForm.processing,
							children: statusForm.processing ? "Menyimpan..." : "Simpan Status"
						})]
					})
				]
			})
		}),
		selectedUnit && /* @__PURE__ */ jsx(Modal, {
			isOpen: isDetailOpen,
			onClose: () => setIsDetailOpen(false),
			title: `Detail Armada: ${selectedUnit.unit_code}`,
			maxWidth: "max-w-2xl",
			children: /* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-slate-50 dark:bg-slate-900 rounded-xl grid grid-cols-2 gap-4 text-sm",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Nomor Lambung"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-900 dark:text-white text-base",
								children: selectedUnit.unit_code
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Nomor Polisi"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono font-bold text-slate-900 dark:text-white",
								children: selectedUnit.registration_number
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Tipe Unit"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-medium text-slate-900 dark:text-white",
								children: formatUnitType(selectedUnit.unit_type)
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Brand & Model"
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-slate-900 dark:text-white",
								children: [
									selectedUnit.brand,
									" ",
									selectedUnit.model,
									" (",
									selectedUnit.year,
									")"
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Kapasitas Muatan"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-semibold text-slate-900 dark:text-white",
								children: [
									selectedUnit.capacity_ton,
									" Ton / ",
									selectedUnit.capacity_m3 || "-",
									" m³"
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Status Terkini"
							}), /* @__PURE__ */ jsx("div", { children: getStatusBadge(selectedUnit.status) })] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Total Hour Meter (HM)"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono font-bold text-slate-900 dark:text-white",
								children: [Number(selectedUnit.last_hm).toLocaleString("id-ID"), " HM"]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Total Kilo Meter (KM)"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-mono font-bold text-slate-900 dark:text-white",
								children: [Number(selectedUnit.last_km).toLocaleString("id-ID"), " KM"]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Nomor Rangka"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono text-xs text-slate-700 dark:text-slate-300",
								children: selectedUnit.chassis_number || "-"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Nomor Mesin"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono text-xs text-slate-700 dark:text-slate-300",
								children: selectedUnit.engine_number || "-"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Site Penempatan"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-slate-900 dark:text-white font-medium",
								children: selectedUnit.site?.name || "-"
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 dark:text-slate-400 block",
								children: "Vendor / Pemilik"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-slate-900 dark:text-white",
								children: selectedUnit.vendor?.name || "Internal TAP"
							})] })
						]
					}),
					selectedUnit.active_work_order && /* @__PURE__ */ jsxs("div", {
						className: "p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold mb-1",
							children: [/* @__PURE__ */ jsx(ShieldAlert, { className: "w-5 h-5" }), /* @__PURE__ */ jsxs("span", { children: ["Work Order Aktif: ", selectedUnit.active_work_order.wo_number] })]
						}), /* @__PURE__ */ jsx("p", {
							className: "text-xs text-rose-600 dark:text-rose-400",
							children: selectedUnit.active_work_order.defect_summary
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							onClick: () => setIsDetailOpen(false),
							children: "Tutup"
						})
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Fleet/WorkOrders/Index.jsx
var Index_exports$15 = /* @__PURE__ */ __exportAll({ default: () => WorkOrdersIndex });
function WorkOrdersIndex({ workOrders = {
	data: [],
	links: []
}, filters = {}, metrics = {}, master = {} }) {
	const [status, setStatus] = useState(filters.status || "");
	const [priority, setPriority] = useState(filters.priority || "");
	const [unitId, setUnitId] = useState(filters.unit_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [selectedWo, setSelectedWo] = useState(null);
	const createForm = useForm({
		unit_id: master.units?.[0]?.id || "",
		source: "road_breakdown",
		priority: "high",
		breakdown_time: (/* @__PURE__ */ new Date()).toISOString().substring(0, 16),
		defect_summary: "",
		assigned_mechanic_id: master.mechanics?.[0]?.id || ""
	});
	const statusForm = useForm({
		status: "in_progress",
		action_taken: "",
		assigned_mechanic_id: ""
	});
	const handleFilter = (e) => {
		e?.preventDefault();
		router.get("/fleet/work-orders", {
			status,
			priority,
			unit_id: unitId
		}, {
			preserveState: true,
			preserveScroll: true
		});
	};
	const handleReset = () => {
		setStatus("");
		setPriority("");
		setUnitId("");
		router.get("/fleet/work-orders");
	};
	const handleOpenStatus = (wo) => {
		setSelectedWo(wo);
		statusForm.setData({
			status: wo.status === "open" ? "in_progress" : wo.status === "in_progress" ? "completed" : wo.status,
			action_taken: wo.action_taken || "",
			assigned_mechanic_id: wo.assigned_mechanic_id || master.mechanics?.[0]?.id || ""
		});
		setIsStatusOpen(true);
	};
	const submitCreate = (e) => {
		e.preventDefault();
		createForm.post("/fleet/work-orders", { onSuccess: () => {
			createForm.reset();
			setIsCreateOpen(false);
		} });
	};
	const submitStatus = (e) => {
		e.preventDefault();
		statusForm.put(`/fleet/work-orders/${selectedWo.id}/status`, { onSuccess: () => {
			setIsStatusOpen(false);
		} });
	};
	const getPriorityBadge = (p) => {
		switch (p) {
			case "critical_emergency": return /* @__PURE__ */ jsx("span", {
				className: "px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase animate-pulse",
				children: "Critical Emergency"
			});
			case "high": return /* @__PURE__ */ jsx("span", {
				className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 uppercase",
				children: "High"
			});
			case "medium": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase",
				children: "Medium"
			});
			case "low": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase",
				children: "Low"
			});
			default: return /* @__PURE__ */ jsx("span", { children: p });
		}
	};
	const getStatusBadge = (st) => {
		switch (st) {
			case "open": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-rose-500" }), "OPEN (ANTRE)"]
			});
			case "in_progress": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500" }), "PROSES PERBAIKAN"]
			});
			case "waiting_parts": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
				children: [/* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500" }), "MENUNGGU SPAREPART"]
			});
			case "completed": return /* @__PURE__ */ jsxs("span", {
				className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
				children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1 text-emerald-600" }), "SELESAI (RESTORED RFU)"]
			});
			case "cancelled": return /* @__PURE__ */ jsx("span", {
				className: "px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
				children: "DIBATALKAN"
			});
			default: return /* @__PURE__ */ jsx("span", { children: st });
		}
	};
	const formatSource = (src) => {
		return {
			p2h_defect: "Temuan P2H Digital",
			road_breakdown: "Breakdown Jalan Hauling",
			scheduled_pm: "Jadwal PM Berkala",
			inspection: "Inspeksi K3LH & Mekanik"
		}[src] || src;
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Work Orders & Perbaikan Maintenance - TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700",
					children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
							children: /* @__PURE__ */ jsx(Wrench, { className: "w-6 h-6" })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-bold text-slate-900 dark:text-white",
							children: "Work Order Perbaikan & Maintenance"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-500 dark:text-slate-400",
							children: "Penerbitan surat perintah kerja perbaikan armada, pelacakan downtime, dan pemulihan status armada ke Siap Operasi (RFU)"
						})] })]
					}) }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center space-x-3 w-full sm:w-auto",
						children: [/* @__PURE__ */ jsxs(Button, {
							variant: "secondary",
							onClick: () => router.get("/fleet/work-orders"),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Segarkan" })]
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "primary",
							onClick: () => setIsCreateOpen(true),
							className: "flex items-center space-x-2",
							children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Terbitkan WO Baru" })]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4",
					children: [
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-slate-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider",
								children: "Total Work Orders"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-slate-900 dark:text-white",
									children: metrics.total || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-400",
									children: "SPK"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-rose-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider",
								children: "Antre (Open)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-rose-600 dark:text-rose-400",
									children: metrics.open || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-rose-500",
									children: "Menunggu"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider",
								children: "In Progress"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-blue-600 dark:text-blue-400",
									children: metrics.in_progress || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-blue-500",
									children: "Sedang Dikerjakan"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-amber-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider",
								children: "Tunggu Part"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-amber-600 dark:text-amber-400",
									children: metrics.waiting_parts || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-amber-500",
									children: "Sparepart"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider",
								children: "Selesai (RFU)"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-emerald-600 dark:text-emerald-400",
									children: metrics.completed || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-emerald-600/80",
									children: "Pulih Siaga"
								})]
							})]
						}),
						/* @__PURE__ */ jsxs(Card, {
							className: "p-4 bg-white dark:bg-slate-800 border-l-4 border-l-purple-500",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider",
								children: "Akumulasi Downtime"
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline justify-between mt-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-2xl font-black text-purple-600 dark:text-purple-400",
									children: metrics.total_downtime_hours || 0
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-purple-500",
									children: "Jam Mati"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx(Card, {
					className: "p-5 bg-white dark:bg-slate-800",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: handleFilter,
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Status Work Order"
							}), /* @__PURE__ */ jsxs("select", {
								value: status,
								onChange: (e) => setStatus(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Semua Status"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "open",
										children: "Open (Antre)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "in_progress",
										children: "In Progress (Perbaikan)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "waiting_parts",
										children: "Waiting Parts"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "completed",
										children: "Completed (Selesai RFU)"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Prioritas"
							}), /* @__PURE__ */ jsxs("select", {
								value: priority,
								onChange: (e) => setPriority(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Semua Prioritas"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "critical_emergency",
										children: "Critical Emergency"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "high",
										children: "High"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "medium",
										children: "Medium"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "low",
										children: "Low"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit"
							}), /* @__PURE__ */ jsxs("select", {
								value: unitId,
								onChange: (e) => setUnitId(e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua Unit"
								}), master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
									value: u.id,
									children: [
										u.unit_code,
										" (",
										u.status,
										")"
									]
								}, u.id))]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-end space-x-2",
								children: [/* @__PURE__ */ jsxs(Button, {
									type: "submit",
									variant: "primary",
									className: "flex-1 flex items-center justify-center space-x-1",
									children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }), /* @__PURE__ */ jsx("span", { children: "Filter" })]
								}), /* @__PURE__ */ jsx(Button, {
									type: "button",
									variant: "secondary",
									onClick: handleReset,
									children: "Reset"
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "w-full text-left border-collapse text-sm",
							children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
								className: "border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300",
								children: [
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "No. WO & Waktu Kejadian"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Armada & Sumber Kerusakan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Ringkasan Kerusakan"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Prioritas"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Mekanik PIC"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Downtime (Jam)"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4",
										children: "Status & Progres"
									}),
									/* @__PURE__ */ jsx("th", {
										className: "py-3.5 px-4 text-right",
										children: "Aksi"
									})
								]
							}) }), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-200 dark:divide-slate-700",
								children: workOrders.data?.length > 0 ? workOrders.data.map((wo) => {
									const downtimeHours = wo.downtime_minutes ? (wo.downtime_minutes / 60).toFixed(1) : "-";
									return /* @__PURE__ */ jsxs("tr", {
										className: "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors",
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsx("div", {
													className: "font-mono font-bold text-slate-900 dark:text-white",
													children: wo.wo_number
												}), /* @__PURE__ */ jsx("div", {
													className: "text-xs text-slate-500",
													children: wo.breakdown_time ? new Date(wo.breakdown_time).toLocaleString("id-ID", {
														dateStyle: "medium",
														timeStyle: "short"
													}) : "-"
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "font-bold text-slate-900 dark:text-white flex items-center space-x-1.5",
													children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4 text-emerald-600" }), /* @__PURE__ */ jsx("span", { children: wo.unit?.unit_code })]
												}), /* @__PURE__ */ jsx("div", {
													className: "text-xs text-slate-500 dark:text-slate-400",
													children: formatSource(wo.source)
												})]
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "py-3.5 px-4 max-w-xs",
												children: [/* @__PURE__ */ jsx("p", {
													className: "text-xs text-slate-800 dark:text-slate-200 line-clamp-2",
													title: wo.defect_summary,
													children: wo.defect_summary
												}), wo.action_taken && /* @__PURE__ */ jsxs("p", {
													className: "text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 italic line-clamp-1",
													children: ["Tindakan: ", wo.action_taken]
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: getPriorityBadge(wo.priority)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ jsxs("div", {
													className: "text-slate-900 dark:text-white text-xs font-medium flex items-center space-x-1",
													children: [/* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-blue-500" }), /* @__PURE__ */ jsx("span", { children: wo.mechanic?.name || "Belum Ditugaskan" })]
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ jsx("span", {
													className: "font-mono text-xs font-bold text-purple-600 dark:text-purple-400",
													children: downtimeHours !== "-" ? `${downtimeHours} Jam` : "Berjalan..."
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4",
												children: getStatusBadge(wo.status)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "py-3.5 px-4 text-right",
												children: /* @__PURE__ */ jsxs(Button, {
													size: "sm",
													variant: wo.status === "completed" ? "secondary" : "primary",
													onClick: () => handleOpenStatus(wo),
													className: "inline-flex items-center space-x-1",
													children: [/* @__PURE__ */ jsx(Wrench, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ jsx("span", { children: wo.status === "completed" ? "Detail" : "Update Status" })]
												})
											})
										]
									}, wo.id);
								}) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
									colSpan: "8",
									className: "py-12 text-center text-slate-400 dark:text-slate-500",
									children: "Belum ada data Work Order perbaikan yang sesuai filter."
								}) })
							})]
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 dark:text-slate-400",
							children: [
								"Menampilkan ",
								workOrders.data?.length || 0,
								" dari ",
								workOrders.total || 0,
								" Work Orders"
							]
						}), /* @__PURE__ */ jsx(Pagination, { links: workOrders.links })]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Terbitkan Work Order (SPK Perbaikan) Baru",
			maxWidth: "max-w-2xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitCreate,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Armada Unit Mengalami Kendala *"
							}), /* @__PURE__ */ jsx("select", {
								required: true,
								value: createForm.data.unit_id,
								onChange: (e) => createForm.setData("unit_id", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: master.units?.map((u) => /* @__PURE__ */ jsxs("option", {
									value: u.id,
									children: [
										u.unit_code,
										" - ",
										u.unit_type,
										" (Status: ",
										u.status,
										")"
									]
								}, u.id))
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Sumber Kejadian *"
							}), /* @__PURE__ */ jsxs("select", {
								required: true,
								value: createForm.data.source,
								onChange: (e) => createForm.setData("source", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "road_breakdown",
										children: "Breakdown Jalan Hauling"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "p2h_defect",
										children: "Temuan P2H Digital Driver"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "scheduled_pm",
										children: "Jadwal PM Berkala"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "inspection",
										children: "Inspeksi Mekanik / K3LH"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Tingkat Prioritas *"
							}), /* @__PURE__ */ jsxs("select", {
								required: true,
								value: createForm.data.priority,
								onChange: (e) => createForm.setData("priority", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "critical_emergency",
										children: "Critical Emergency (Stop Operasi)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "high",
										children: "High (Mendesak)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "medium",
										children: "Medium (Normal)"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "low",
										children: "Low (Ringan)"
									})
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Waktu Mulai Breakdown *"
							}), /* @__PURE__ */ jsx("input", {
								type: "datetime-local",
								required: true,
								value: createForm.data.breakdown_time,
								onChange: (e) => createForm.setData("breakdown_time", e.target.value),
								className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
									children: "Mekanik PIC / Penanggung Jawab"
								}), /* @__PURE__ */ jsxs("select", {
									value: createForm.data.assigned_mechanic_id,
									onChange: (e) => createForm.setData("assigned_mechanic_id", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
									children: [/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Pilih Mekanik"
									}), master.mechanics?.map((m) => /* @__PURE__ */ jsxs("option", {
										value: m.id,
										children: [
											m.name,
											" (",
											m.employee_code,
											")"
										]
									}, m.id))]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "sm:col-span-2",
								children: [/* @__PURE__ */ jsx("label", {
									className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
									children: "Deskripsi Kerusakan / Gejala *"
								}), /* @__PURE__ */ jsx("textarea", {
									rows: "3",
									required: true,
									placeholder: "Contoh: Mesin overheat di hauling road KM 14, selang radiator bocor, perlu penggantian selang dan coolant...",
									value: createForm.data.defect_summary,
									onChange: (e) => createForm.setData("defect_summary", e.target.value),
									className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300",
						children: [
							/* @__PURE__ */ jsx("strong", { children: "Catatan:" }),
							" Penerbitan Work Order ini otomatis mengubah status unit yang dipilih menjadi ",
							/* @__PURE__ */ jsx("strong", { children: "BREAKDOWN" }),
							" dan membatasi penugasan di Daily Dispatch."
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "primary",
							disabled: createForm.processing,
							children: createForm.processing ? "Menerbitkan..." : "Terbitkan Work Order"
						})]
					})
				]
			})
		}),
		selectedWo && /* @__PURE__ */ jsx(Modal, {
			isOpen: isStatusOpen,
			onClose: () => setIsStatusOpen(false),
			title: `Update Status Work Order: ${selectedWo.wo_number}`,
			maxWidth: "max-w-xl",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: submitStatus,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1 text-xs",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500",
								children: "Armada Unit:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-bold text-slate-900 dark:text-white text-sm",
								children: selectedWo.unit?.unit_code
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500",
								children: "Kerusakan:"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-slate-800 dark:text-slate-200",
								children: selectedWo.defect_summary
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Progres *"
					}), /* @__PURE__ */ jsxs("select", {
						required: true,
						value: statusForm.data.status,
						onChange: (e) => statusForm.setData("status", e.target.value),
						className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "open",
								children: "Open (Antre Diperiksa)"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "in_progress",
								children: "In Progress (Sedang Dikerjakan Mekanik)"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "waiting_parts",
								children: "Waiting Parts (Menunggu Ketersediaan Sparepart)"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "completed",
								children: "Completed (Perbaikan Selesai - Pulihkan ke RFU!)"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "cancelled",
								children: "Cancelled (Dibatalkan)"
							})
						]
					})] }),
					statusForm.data.status === "completed" && /* @__PURE__ */ jsxs("div", {
						className: "p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start space-x-2 text-xs text-emerald-800 dark:text-emerald-200",
						children: [/* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("strong", { children: "Pemulihan Status Armada Otomatis:" }), /* @__PURE__ */ jsxs("p", {
							className: "mt-0.5",
							children: [
								"Dengan menandai status ",
								/* @__PURE__ */ jsx("strong", { children: "COMPLETED" }),
								", sistem akan mencatat waktu selesai, menghitung total menit downtime, dan secara otomatis ",
								/* @__PURE__ */ jsx("strong", { children: "MENGEMBALIKAN STATUS ARMADA MENJADI STANDBY / RFU (READY FOR USE)" }),
								" sehingga siap dijadwalkan kembali dalam Daily Dispatch."
							]
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Mekanik PIC"
					}), /* @__PURE__ */ jsxs("select", {
						value: statusForm.data.assigned_mechanic_id,
						onChange: (e) => statusForm.setData("assigned_mechanic_id", e.target.value),
						className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Pilih Mekanik"
						}), master.mechanics?.map((m) => /* @__PURE__ */ jsxs("option", {
							value: m.id,
							children: [
								m.name,
								" (",
								m.employee_code,
								")"
							]
						}, m.id))]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Tindakan Perbaikan yang Dilakukan"
					}), /* @__PURE__ */ jsx("textarea", {
						rows: "3",
						placeholder: "Contoh: Penggantian selang radiator atas, pengisian coolant baru 10 liter, uji running mesin 15 menit temperatur normal...",
						value: statusForm.data.action_taken,
						onChange: (e) => statusForm.setData("action_taken", e.target.value),
						className: "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsStatusOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "primary",
							disabled: statusForm.processing,
							children: statusForm.processing ? "Menyimpan..." : "Perbarui Status"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Locations/Index.jsx
var Index_exports$14 = /* @__PURE__ */ __exportAll({ default: () => LocationsIndex });
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
var Index_exports$13 = /* @__PURE__ */ __exportAll({ default: () => MaterialsIndex });
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
var Index_exports$12 = /* @__PURE__ */ __exportAll({ default: () => OrganizationIndex });
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
// resources/js/Pages/Production/Dashboard.jsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => ProductionDashboard });
function ProductionDashboard({ site_id, sites = [], kpi = {}, shift_breakdown = [], top_units = [], top_drivers = [], daily_chart = [], monthly_chart = [], active_dispatches = [] }) {
	const [selectedSite, setSelectedSite] = useState(site_id || "");
	const handleSiteChange = (e) => {
		const val = e.target.value;
		setSelectedSite(val);
		router.get("/production/dashboard", { site_id: val }, { preserveState: true });
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Production Dashboard — Coal Hauling TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-emerald-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Dashboard Produksi Coal Hauling"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Monitoring ritase, tonase resmi, pencapaian target, dan performa armada real-time"
				})] })]
			}) }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "w-64",
					children: /* @__PURE__ */ jsx(Select, {
						value: selectedSite,
						onChange: handleSiteChange,
						options: [{
							value: "",
							label: "Pilih Site Tambang"
						}, ...sites.map((s) => ({
							value: s.id,
							label: `${s.name} (${s.code})`
						}))]
					})
				}), /* @__PURE__ */ jsxs(Button, {
					variant: "secondary",
					onClick: () => router.get("/production/tickets/verification-queue"),
					className: "relative",
					children: [
						/* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 mr-2 text-amber-500" }),
						"Antrean Verifikasi",
						kpi.pending_verification_count > 0 && /* @__PURE__ */ jsx("span", {
							className: "ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white",
							children: kpi.pending_verification_count
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6",
			children: [
				/* @__PURE__ */ jsxs(Card, {
					className: "p-5 border-l-4 border-l-emerald-500",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
								children: "Produksi Hari Ini (Verified)"
							}), /* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
								children: /* @__PURE__ */ jsx(Scale, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-black text-slate-900 dark:text-white",
								children: Number(kpi.today_tonnage || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 })
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm font-semibold text-slate-500",
								children: "Ton"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-slate-500",
								children: ["Total Ritase: ", /* @__PURE__ */ jsxs("strong", {
									className: "text-slate-900 dark:text-white",
									children: [kpi.today_ritase || 0, " Rit"]
								})]
							}), /* @__PURE__ */ jsx("span", {
								className: "text-emerald-600 dark:text-emerald-400 font-medium",
								children: "100% Verified"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-5 border-l-4 border-l-blue-500",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
								children: [
									"Target Harian (",
									kpi.daily_achieve_pct || 0,
									"%)"
								]
							}), /* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
								children: /* @__PURE__ */ jsx(Target, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-black text-slate-900 dark:text-white",
								children: Number(kpi.daily_target_ton || 0).toLocaleString("id-ID")
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm font-semibold text-slate-500",
								children: "Ton Target"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden",
							children: /* @__PURE__ */ jsx("div", {
								className: `h-full rounded-full ${kpi.daily_achieve_pct >= 100 ? "bg-emerald-500" : "bg-blue-500"}`,
								style: { width: `${Math.min(kpi.daily_achieve_pct || 0, 100)}%` }
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between mt-2 text-xs text-slate-500",
							children: [/* @__PURE__ */ jsxs("span", { children: [
								"Aktual: ",
								Number(kpi.today_tonnage || 0).toFixed(1),
								" T"
							] }), /* @__PURE__ */ jsx("span", {
								className: kpi.daily_variance >= 0 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold",
								children: kpi.daily_variance >= 0 ? `+${kpi.daily_variance} T` : `${kpi.daily_variance} T`
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-5 border-l-4 border-l-purple-500",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
								children: "Akumulasi Bulan Ini"
							}), /* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
								children: /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-2xl font-black text-slate-900 dark:text-white",
								children: Number(kpi.monthly_tonnage || 0).toLocaleString("id-ID", { minimumFractionDigits: 1 })
							}), /* @__PURE__ */ jsx("span", {
								className: "text-sm font-semibold text-slate-500",
								children: "Ton"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-slate-500",
								children: ["Ritase: ", /* @__PURE__ */ jsxs("strong", {
									className: "text-slate-900 dark:text-white",
									children: [kpi.monthly_ritase || 0, " Rit"]
								})]
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-purple-600 dark:text-purple-400 font-semibold",
								children: [kpi.monthly_achieve_pct || 0, "% Target"]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-5 border-l-4 border-l-amber-500",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400",
								children: "Status Validasi Tiket"
							}), /* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
								children: /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4" })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between mt-1",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 block",
								children: "Pending Verifikasi"
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xl font-bold text-amber-600 dark:text-amber-400",
								children: [kpi.pending_verification_count || 0, " Tiket"]
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "text-right",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 block",
									children: "Ditolak (Rejected)"
								}), /* @__PURE__ */ jsxs("span", {
									className: "text-xl font-bold text-rose-600 dark:text-rose-400",
									children: [kpi.rejected_count || 0, " Tiket"]
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center",
							children: [/* @__PURE__ */ jsxs("span", { children: ["External Source: ", /* @__PURE__ */ jsx("strong", { children: "JSI Checker" })] }), /* @__PURE__ */ jsx("span", {
								className: "text-slate-400",
								children: "Auto Discrepancy"
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "p-5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-emerald-600" }), "Produksi Shift Hari Ini"]
						}), /* @__PURE__ */ jsx(Badge, {
							variant: "outline",
							children: "2 Shift 24 Jam"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "space-y-4",
						children: shift_breakdown.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "text-sm text-slate-400 text-center py-6",
							children: "Belum ada tiket terverifikasi hari ini"
						}) : shift_breakdown.map((s, idx) => /* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center mb-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-semibold text-slate-800 dark:text-slate-200 text-sm",
									children: s.shift_name
								}), /* @__PURE__ */ jsxs(Badge, {
									variant: idx === 0 ? "success" : "info",
									children: [s.ritase, " Rit"]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-baseline text-xs text-slate-500",
								children: [/* @__PURE__ */ jsx("span", { children: "Tonase Resmi:" }), /* @__PURE__ */ jsxs("span", {
									className: "text-base font-extrabold text-slate-900 dark:text-white",
									children: [Number(s.total_tonnage).toFixed(2), " Ton"]
								})]
							})]
						}, idx))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 pt-4 border-t border-slate-100 dark:border-slate-800",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-xs font-bold uppercase tracking-wider text-slate-500 mb-3",
							children: "Jadwal Dispatch Aktif Hari Ini"
						}), active_dispatches.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400",
							children: "Tidak ada jadwal dispatch aktif."
						}) : /* @__PURE__ */ jsx("div", {
							className: "space-y-2",
							children: active_dispatches.map((d) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-100 dark:bg-slate-800",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-mono font-semibold text-slate-700 dark:text-slate-300",
										children: d.dispatch_number
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-slate-500",
										children: d.shift?.name
									}),
									/* @__PURE__ */ jsxs(Badge, {
										variant: "primary",
										children: [d.assignments?.length || 0, " DT Ditugaskan"]
									})
								]
							}, d.id))
						})]
					})
				]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "p-5 lg:col-span-2",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between mb-4",
					children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(BarChart3, { className: "w-4 h-4 text-blue-600" }), "Tren Produksi Harian (Tonase Resmi)"]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500",
						children: "Data terverifikasi masuk rekap produksi TAP"
					})] })
				}), daily_chart.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "h-48 flex items-center justify-center text-slate-400 text-sm",
					children: "Belum ada riwayat tonase harian."
				}) : /* @__PURE__ */ jsx("div", {
					className: "space-y-3 pt-2",
					children: daily_chart.map((d, idx) => {
						const maxTon = Math.max(...daily_chart.map((item) => Number(item.tonnage) || 1));
						const pct = Math.max(Number(d.tonnage) / maxTon * 100, 5);
						return /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 text-xs",
							children: [/* @__PURE__ */ jsx("span", {
								className: "w-20 font-mono text-slate-500 shrink-0",
								children: d.ticket_date
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex-1 bg-slate-100 dark:bg-slate-800 h-6 rounded-md overflow-hidden relative flex items-center",
								children: [/* @__PURE__ */ jsx("div", {
									className: "bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-md transition-all duration-500",
									style: { width: `${pct}%` }
								}), /* @__PURE__ */ jsxs("span", {
									className: "absolute right-3 font-semibold text-slate-700 dark:text-slate-200",
									children: [
										Number(d.tonnage).toLocaleString("id-ID"),
										" Ton (",
										d.ritase,
										" Rit)"
									]
								})]
							})]
						}, idx);
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between mb-4",
					children: /* @__PURE__ */ jsxs("h2", {
						className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4 text-indigo-600" }), "Top 10 Armada Berdasarkan Tonase (Bulan Ini)"]
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "#"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "No. Lambung"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Tipe"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-right",
									children: "Total Tonase"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: top_units.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: "5",
								className: "py-4 text-center text-slate-400",
								children: "Belum ada data armada"
							}) }) : top_units.map((u, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 font-bold text-slate-400",
										children: idx + 1
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2",
										children: [/* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), u.unit_code]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-slate-500",
										children: u.unit_type === "dump_truck_10" ? "DT 10 Roda" : u.unit_type === "dump_truck_12" ? "DT 12 Roda" : u.unit_type
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-center font-semibold",
										children: u.total_ritase
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400",
										children: [Number(u.total_tonnage).toFixed(2), " T"]
									})
								]
							}, idx))
						})]
					})
				})]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "p-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between mb-4",
					children: /* @__PURE__ */ jsxs("h2", {
						className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-purple-600" }), "Top 10 Driver Berdasarkan Tonase (Bulan Ini)"]
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "#"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Nama Driver"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Status MCU"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-right",
									children: "Total Tonase"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: top_drivers.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: "5",
								className: "py-4 text-center text-slate-400",
								children: "Belum ada data driver"
							}) }) : top_drivers.map((d, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 font-bold text-slate-400",
										children: idx + 1
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3",
										children: [/* @__PURE__ */ jsx("div", {
											className: "font-semibold text-slate-900 dark:text-white",
											children: d.driver_name
										}), /* @__PURE__ */ jsx("div", {
											className: "text-[10px] text-slate-400",
											children: d.driver_code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: d.mcu_status === "fit" ? "success" : "warning",
											children: d.mcu_status === "fit" ? "Fit Medis" : "Fit Bersyarat"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-center font-semibold",
										children: d.total_ritase
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400",
										children: [Number(d.total_tonnage).toFixed(2), " T"]
									})
								]
							}, idx))
						})]
					})
				})]
			})]
		})
	] });
}
// resources/js/Pages/Production/Dispatch/Index.jsx
var Index_exports$11 = /* @__PURE__ */ __exportAll({ default: () => DispatchIndex });
function DispatchIndex({ dispatches = [], filters = {}, summary = {}, master = {} }) {
	const [filterDate, setFilterDate] = useState(filters.date || "");
	const [filterShift, setFilterShift] = useState(filters.shift_id || "");
	const [filterSite, setFilterSite] = useState(filters.site_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isAddAssignOpen, setIsAddAssignOpen] = useState(false);
	const [selectedDispatch, setSelectedDispatch] = useState(null);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [selectedAssignment, setSelectedAssignment] = useState(null);
	const createForm = useForm({
		date: filters.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		site_id: master.sites?.[0]?.id || "",
		shift_id: master.shifts?.[0]?.id || "",
		supervisor_id: master.supervisors?.[0]?.id || "",
		notes: ""
	});
	const assignForm = useForm({
		unit_id: master.units?.[0]?.id || "",
		driver_id: master.drivers?.[0]?.id || "",
		loading_point_id: master.loading_points?.[0]?.id || "",
		dumping_point_id: master.dumping_points?.[0]?.id || "",
		material_id: master.materials?.[0]?.id || "",
		target_ritase: 5,
		remarks: ""
	});
	const statusForm = useForm({
		status: "operating",
		reason: ""
	});
	const swapForm = useForm({
		unit_id: "",
		driver_id: "",
		reason: ""
	});
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/dispatch", {
			date: filterDate,
			shift_id: filterShift,
			site_id: filterSite
		}, { preserveState: true });
	};
	const handleCreateDispatch = (e) => {
		e.preventDefault();
		createForm.post("/production/dispatch", { onSuccess: () => {
			setIsCreateOpen(false);
			createForm.reset();
		} });
	};
	const handleAddAssignment = (e) => {
		e.preventDefault();
		if (!selectedDispatch) return;
		assignForm.post(`/production/dispatch/${selectedDispatch.id}/assignments`, { onSuccess: () => {
			setIsAddAssignOpen(false);
			assignForm.reset();
		} });
	};
	const handleStatusSubmit = (e) => {
		e.preventDefault();
		if (!selectedAssignment) return;
		statusForm.put(`/production/assignments/${selectedAssignment.id}/status`, { onSuccess: () => {
			setIsStatusModalOpen(false);
			statusForm.reset();
		} });
	};
	const handleSwapSubmit = (e) => {
		e.preventDefault();
		if (!selectedAssignment) return;
		swapForm.put(`/production/assignments/${selectedAssignment.id}/swap`, { onSuccess: () => {
			setIsSwapModalOpen(false);
			swapForm.reset();
		} });
	};
	const openSwap = (asg) => {
		setSelectedAssignment(asg);
		swapForm.setData({
			unit_id: asg.unit_id,
			driver_id: asg.driver_id,
			reason: ""
		});
		setIsSwapModalOpen(true);
	};
	const openStatus = (asg) => {
		setSelectedAssignment(asg);
		statusForm.setData({
			status: asg.status,
			reason: ""
		});
		setIsStatusModalOpen(true);
	};
	const openHistory = (asg) => {
		setSelectedAssignment(asg);
		setIsHistoryModalOpen(true);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Daily Dispatch Board — TAP Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-blue-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(CalendarCheck, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Daily Dispatch Board"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Pengaturan jadwal operasional harian, alokasi armada DT, penugasan driver, dan rute hauling"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsCreateOpen(true),
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }), "Buat Jadwal Dispatch"]
				})
			})]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Tanggal Operasional"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: filterDate,
						onChange: (e) => setFilterDate(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Shift Kerja"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterShift,
						onChange: (e) => setFilterShift(e.target.value),
						options: [{
							value: "",
							label: "Semua Shift"
						}, ...master.shifts?.map((s) => ({
							value: s.id,
							label: s.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Site Proyek"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterSite,
						onChange: (e) => setFilterSite(e.target.value),
						options: [{
							value: "",
							label: "Semua Site"
						}, ...master.sites?.map((s) => ({
							value: s.id,
							label: s.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-2",
						children: /* @__PURE__ */ jsxs(Button, {
							type: "submit",
							variant: "secondary",
							className: "w-full",
							children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Terapkan Filter"]
						})
					})
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-slate-500 uppercase",
						children: "Total Unit Ditugaskan"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-slate-900 dark:text-white mt-1",
						children: [summary.assigned_units || 0, " DT"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase",
						children: "Operating (Jalan)"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1",
						children: [summary.operating_units || 0, " DT"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase",
						children: "Standby"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-amber-600 dark:text-amber-400 mt-1",
						children: [summary.standby_units || 0, " DT"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase",
						children: "Breakdown"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-rose-600 dark:text-rose-400 mt-1",
						children: [summary.breakdown_units || 0, " DT"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase",
						children: "Target Ritase"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-blue-600 dark:text-blue-400 mt-1",
						children: [summary.target_ritase || 0, " Rit"]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase",
						children: "Ritase Tercapai"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-purple-600 dark:text-purple-400 mt-1",
						children: [summary.actual_ritase || 0, " Rit"]
					})]
				})
			]
		}),
		dispatches.length === 0 ? /* @__PURE__ */ jsxs(Card, {
			className: "p-12 text-center text-slate-500",
			children: [
				/* @__PURE__ */ jsx(CalendarCheck, { className: "w-12 h-12 mx-auto mb-3 text-slate-300" }),
				/* @__PURE__ */ jsx("p", {
					className: "text-base font-semibold",
					children: "Tidak ada jadwal dispatch pada tanggal ini"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-400 mt-1",
					children: "Gunakan tombol \"Buat Jadwal Dispatch\" di kanan atas untuk membuat penugasan shift baru."
				})
			]
		}) : /* @__PURE__ */ jsx("div", {
			className: "space-y-6",
			children: dispatches.map((disp) => /* @__PURE__ */ jsxs(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "p-4 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx(Badge, {
							variant: "primary",
							className: "font-mono text-xs",
							children: disp.dispatch_number
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
							className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
							children: [disp.shift?.name, /* @__PURE__ */ jsxs("span", {
								className: "text-xs font-normal text-slate-500",
								children: [
									"(",
									disp.date,
									")"
								]
							})]
						}), /* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-500",
							children: [
								"Site: ",
								/* @__PURE__ */ jsx("strong", { children: disp.site?.name }),
								" • Supervisor: ",
								/* @__PURE__ */ jsx("strong", { children: disp.supervisor?.name || "Belum ditentukan" })
							]
						})] })]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx(Badge, {
							variant: disp.status === "completed" ? "secondary" : "success",
							children: disp.status.toUpperCase()
						}), /* @__PURE__ */ jsxs(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								setSelectedDispatch(disp);
								setIsAddAssignOpen(true);
							},
							children: [/* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5 mr-1" }), "Tambah Unit DT"]
						})]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-100/60 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "No. Lambung"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Driver"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Loading Point"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Dumping Point"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Material"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-center",
									children: "Ritase (Akt / Tgt)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-center",
									children: "Status"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3 text-right",
									children: "Aksi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: disp.assignments.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: "8",
								className: "py-6 text-center text-slate-400",
								children: "Belum ada armada dump truck yang dialokasikan pada dispatch ini."
							}) }) : disp.assignments.map((asg) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/30",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2",
										children: [
											/* @__PURE__ */ jsx(Truck, { className: "w-3.5 h-3.5 text-slate-400" }),
											asg.unit?.unit_code,
											/* @__PURE__ */ jsxs("span", {
												className: "text-[10px] text-slate-400 font-normal",
												children: [
													"(",
													asg.unit?.unit_type === "dump_truck_10" ? "10 Roda" : "12 Roda",
													")"
												]
											})
										]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3",
										children: [/* @__PURE__ */ jsx("div", {
											className: "font-semibold text-slate-800 dark:text-slate-200",
											children: asg.driver?.employee?.name
										}), /* @__PURE__ */ jsx("div", {
											className: "text-[10px] text-slate-400",
											children: asg.driver?.driver_code
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-slate-700 dark:text-slate-300",
										children: asg.loading_point?.name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-slate-700 dark:text-slate-300",
										children: asg.dumping_point?.name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											children: asg.material?.code
										})
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2.5 px-3 text-center font-bold",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "text-emerald-600 dark:text-emerald-400",
												children: asg.actual_ritase
											}),
											" / ",
											asg.target_ritase
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-center",
										children: /* @__PURE__ */ jsx("span", {
											onClick: () => openStatus(asg),
											className: `cursor-pointer inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${asg.status === "operating" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : asg.status === "breakdown" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : asg.status === "standby" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`,
											children: asg.status
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2.5 px-3 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex gap-1",
											children: [/* @__PURE__ */ jsx("button", {
												onClick: () => openSwap(asg),
												title: "Tukar Unit / Driver",
												className: "p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300",
												children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-3.5 h-3.5" })
											}), /* @__PURE__ */ jsx("button", {
												onClick: () => openHistory(asg),
												title: "Histori Perubahan",
												className: "p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300",
												children: /* @__PURE__ */ jsx(History, { className: "w-3.5 h-3.5" })
											})]
										})
									})
								]
							}, asg.id))
						})]
					})
				})]
			}, disp.id))
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Buat Jadwal Daily Dispatch Baru",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreateDispatch,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Tanggal Operasional"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: createForm.data.date,
						onChange: (e) => createForm.setData("date", e.target.value),
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Site Proyek"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.site_id,
							onChange: (e) => createForm.setData("site_id", e.target.value),
							options: master.sites?.map((s) => ({
								value: s.id,
								label: s.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Shift Kerja"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.shift_id,
							onChange: (e) => createForm.setData("shift_id", e.target.value),
							options: master.shifts?.map((s) => ({
								value: s.id,
								label: s.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Supervisor Bertugas"
					}), /* @__PURE__ */ jsx(Select, {
						value: createForm.data.supervisor_id,
						onChange: (e) => createForm.setData("supervisor_id", e.target.value),
						options: master.supervisors?.map((sup) => ({
							value: sup.id,
							label: `${sup.name} (${sup.employee_code})`
						})) || []
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Catatan Operasional"
					}), /* @__PURE__ */ jsx("textarea", {
						value: createForm.data.notes,
						onChange: (e) => createForm.setData("notes", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2",
						rows: 3,
						placeholder: "Catatan kondisi jalan hauling, cuaca, atau prioritas ROM..."
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: createForm.processing,
							children: "Simpan Jadwal"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isAddAssignOpen,
			onClose: () => setIsAddAssignOpen(false),
			title: `Tambah Unit DT ke ${selectedDispatch?.dispatch_number || ""}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleAddAssignment,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Pilih Unit DT"
						}), /* @__PURE__ */ jsx(Select, {
							value: assignForm.data.unit_id,
							onChange: (e) => assignForm.setData("unit_id", e.target.value),
							options: master.units?.map((u) => ({
								value: u.id,
								label: `${u.unit_code} (${u.unit_type})`
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Pilih Driver"
						}), /* @__PURE__ */ jsx(Select, {
							value: assignForm.data.driver_id,
							onChange: (e) => assignForm.setData("driver_id", e.target.value),
							options: master.drivers?.map((d) => ({
								value: d.id,
								label: `${d.employee?.name} (${d.driver_code})`
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Loading Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: assignForm.data.loading_point_id,
							onChange: (e) => assignForm.setData("loading_point_id", e.target.value),
							options: master.loading_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Dumping Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: assignForm.data.dumping_point_id,
							onChange: (e) => assignForm.setData("dumping_point_id", e.target.value),
							options: master.dumping_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Material"
						}), /* @__PURE__ */ jsx(Select, {
							value: assignForm.data.material_id,
							onChange: (e) => assignForm.setData("material_id", e.target.value),
							options: master.materials?.map((m) => ({
								value: m.id,
								label: m.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Target Ritase"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							min: 1,
							value: assignForm.data.target_ritase,
							onChange: (e) => assignForm.setData("target_ritase", e.target.value),
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Keterangan Khusus"
					}), /* @__PURE__ */ jsx(Input, {
						value: assignForm.data.remarks,
						onChange: (e) => assignForm.setData("remarks", e.target.value),
						placeholder: "Catatan penugasan armada..."
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsAddAssignOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: assignForm.processing,
							children: "Tambahkan ke Dispatch"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isStatusModalOpen,
			onClose: () => setIsStatusModalOpen(false),
			title: `Ubah Status: Unit ${selectedAssignment?.unit?.unit_code}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleStatusSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Baru"
					}), /* @__PURE__ */ jsx(Select, {
						value: statusForm.data.status,
						onChange: (e) => statusForm.setData("status", e.target.value),
						options: [
							{
								value: "assigned",
								label: "Assigned (Menunggu)"
							},
							{
								value: "operating",
								label: "Operating (Aktif Jalan)"
							},
							{
								value: "standby",
								label: "Standby"
							},
							{
								value: "breakdown",
								label: "Breakdown (Rusak)"
							},
							{
								value: "completed",
								label: "Completed (Selesai)"
							},
							{
								value: "cancelled",
								label: "Cancelled (Dibatalkan)"
							}
						],
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Alasan Perubahan (Audit Trail)"
					}), /* @__PURE__ */ jsx("textarea", {
						value: statusForm.data.reason,
						onChange: (e) => statusForm.setData("reason", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2",
						rows: 3,
						placeholder: "Wajib mengisi alasan (misal: Unit ban bocor di KM 12, pergantian shift, dll)...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsStatusModalOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: statusForm.processing,
							children: "Simpan Status"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isSwapModalOpen,
			onClose: () => setIsSwapModalOpen(false),
			title: `Swap Unit / Driver (${selectedAssignment?.unit?.unit_code})`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSwapSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Ganti Unit Armada"
					}), /* @__PURE__ */ jsx(Select, {
						value: swapForm.data.unit_id,
						onChange: (e) => swapForm.setData("unit_id", e.target.value),
						options: master.units?.map((u) => ({
							value: u.id,
							label: `${u.unit_code} (${u.status})`
						})) || [],
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Ganti Driver"
					}), /* @__PURE__ */ jsx(Select, {
						value: swapForm.data.driver_id,
						onChange: (e) => swapForm.setData("driver_id", e.target.value),
						options: master.drivers?.map((d) => ({
							value: d.id,
							label: `${d.employee?.name} (${d.driver_code})`
						})) || [],
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Alasan Penukaran"
					}), /* @__PURE__ */ jsx("textarea", {
						value: swapForm.data.reason,
						onChange: (e) => swapForm.setData("reason", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2",
						rows: 3,
						placeholder: "Alasan pergantian unit atau driver (misal: driver sakit, unit swap untuk service)...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsSwapModalOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: swapForm.processing,
							children: "Simpan Penukaran"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isHistoryModalOpen,
			onClose: () => setIsHistoryModalOpen(false),
			title: `Audit Log: Unit ${selectedAssignment?.unit?.unit_code}`,
			children: /* @__PURE__ */ jsx("div", {
				className: "space-y-3 max-h-96 overflow-y-auto",
				children: selectedAssignment?.logs?.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "text-xs text-slate-400 text-center py-4",
					children: "Belum ada riwayat perubahan."
				}) : selectedAssignment?.logs?.map((log) => /* @__PURE__ */ jsxs("div", {
					className: "p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between items-center mb-1",
							children: [/* @__PURE__ */ jsx(Badge, {
								variant: "outline",
								children: log.change_type.toUpperCase()
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[10px] text-slate-400",
								children: log.created_at
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "font-medium text-slate-800 dark:text-slate-200",
							children: log.reason
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-1 text-[11px] text-slate-500",
							children: ["Diubah oleh: ", /* @__PURE__ */ jsx("strong", { children: log.user?.name || "Sistem" })]
						})
					]
				}, log.id))
			})
		})
	] });
}
// resources/js/Pages/Production/Hauling/Index.jsx
var Index_exports$10 = /* @__PURE__ */ __exportAll({ default: () => HaulingIndex });
function HaulingIndex({ activities = { data: [] }, filters = {}, metrics = {}, master = {} }) {
	const [filterDate, setFilterDate] = useState(filters.date || "");
	const [filterStatus, setFilterStatus] = useState(filters.status || "");
	const [filterUnit, setFilterUnit] = useState(filters.unit_id || "");
	const [filterShift, setFilterShift] = useState(filters.shift_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState(null);
	const createForm = useForm({
		unit_id: master.units?.[0]?.id || "",
		driver_id: master.drivers?.[0]?.id || "",
		loading_point_id: master.loading_points?.[0]?.id || "",
		dumping_point_id: master.dumping_points?.[0]?.id || "",
		material_id: master.materials?.[0]?.id || "",
		shift_id: master.shifts?.[0]?.id || "",
		activity_date: filters.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		journey_status: "loading",
		delay_type: "",
		delay_duration_minutes: 0,
		delay_notes: ""
	});
	const statusForm = useForm({
		journey_status: "hauling",
		delay_type: "",
		delay_duration_minutes: 0,
		delay_notes: ""
	});
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/hauling", {
			date: filterDate,
			status: filterStatus,
			unit_id: filterUnit,
			shift_id: filterShift
		}, { preserveState: true });
	};
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		createForm.post("/production/hauling", { onSuccess: () => {
			setIsCreateOpen(false);
			createForm.reset();
		} });
	};
	const handleStatusSubmit = (e) => {
		e.preventDefault();
		if (!selectedActivity) return;
		statusForm.put(`/production/hauling/${selectedActivity.id}/status`, { onSuccess: () => {
			setIsUpdateStatusOpen(false);
			statusForm.reset();
		} });
	};
	const openStatusModal = (act) => {
		setSelectedActivity(act);
		statusForm.setData({
			journey_status: act.journey_status,
			delay_type: act.delay_type || "",
			delay_duration_minutes: act.delay_duration_minutes || 0,
			delay_notes: act.delay_notes || ""
		});
		setIsUpdateStatusOpen(true);
	};
	const getJourneyBadge = (status) => {
		switch (status) {
			case "loading": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "Loading di Front"
			});
			case "hauling": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				children: "Hauling (Jalan)"
			});
			case "queueing_dump": return /* @__PURE__ */ jsx(Badge, {
				variant: "secondary",
				children: "Antre Dumping"
			});
			case "dumped": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Selesai Dumping"
			});
			case "returning": return /* @__PURE__ */ jsx(Badge, {
				variant: "info",
				children: "Kosongan Balik"
			});
			case "delay_breakdown": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Delay Breakdown"
			});
			case "delay_weather": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Delay Hujan/Slippery"
			});
			case "delay_road": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Kendala Jalan"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Loading & Hauling Tracking — TAP" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-teal-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(Route, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Loading & Hauling Activity Log"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Pencatatan posisi perjalanan armada, waktu siklus loading-dumping, dan pencatatan hambatan"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsCreateOpen(true),
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }), "Catat Perjalanan Baru"]
				})
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-slate-500 uppercase",
						children: "Total Log Aktivitas"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-slate-900 dark:text-white mt-1",
						children: metrics.total || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase",
						children: "Sedang Loading"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-amber-600 dark:text-amber-400 mt-1",
						children: metrics.loading || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase",
						children: "In-Transit Hauling"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-blue-600 dark:text-blue-400 mt-1",
						children: metrics.hauling || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase",
						children: "Selesai Dumping"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1",
						children: metrics.dumped || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase",
						children: "Mengalami Kendala/Delay"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-rose-600 dark:text-rose-400 mt-1",
						children: metrics.delayed || 0
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Tanggal"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: filterDate,
						onChange: (e) => setFilterDate(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Status Perjalanan"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterStatus,
						onChange: (e) => setFilterStatus(e.target.value),
						options: [
							{
								value: "",
								label: "Semua Status"
							},
							{
								value: "loading",
								label: "Loading di Front"
							},
							{
								value: "hauling",
								label: "Hauling (Jalan)"
							},
							{
								value: "queueing_dump",
								label: "Antre Dumping"
							},
							{
								value: "dumped",
								label: "Selesai Dumping"
							},
							{
								value: "returning",
								label: "Kosongan Balik"
							},
							{
								value: "delay_breakdown",
								label: "Delay Breakdown"
							},
							{
								value: "delay_weather",
								label: "Delay Cuaca/Hujan"
							},
							{
								value: "delay_road",
								label: "Delay Jalur"
							}
						]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Armada DT"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterUnit,
						onChange: (e) => setFilterUnit(e.target.value),
						options: [{
							value: "",
							label: "Semua Armada"
						}, ...master.units?.map((u) => ({
							value: u.id,
							label: u.unit_code
						})) || []]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Shift"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterShift,
						onChange: (e) => setFilterShift(e.target.value),
						options: [{
							value: "",
							label: "Semua Shift"
						}, ...master.shifts?.map((s) => ({
							value: s.id,
							label: s.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Filter Data"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Armada & Driver"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Rute Hauling"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Shift & Tanggal"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Waktu Loading"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Waktu Hauling"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Waktu Dumping"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Kendala / Delay"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Aksi"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: activities.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: "9",
							className: "py-8 text-center text-slate-400",
							children: "Tidak ada catatan aktivitas perjalanan hauling pada filter ini."
						}) }) : activities.data.map((act) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
										children: [/* @__PURE__ */ jsx(Truck, { className: "w-3.5 h-3.5 text-slate-400" }), act.unit?.unit_code]
									}), /* @__PURE__ */ jsx("div", {
										className: "text-[11px] text-slate-500",
										children: act.driver?.employee?.name
									})]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 text-slate-700 dark:text-slate-300",
										children: [/* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 text-emerald-500" }), /* @__PURE__ */ jsx("span", { children: act.loading_point?.name })]
									}), /* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1 text-slate-500 text-[11px]",
										children: [/* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3 text-blue-500" }), /* @__PURE__ */ jsx("span", { children: act.dumping_point?.name })]
									})]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-slate-600 dark:text-slate-400",
									children: [/* @__PURE__ */ jsx("div", { children: act.shift?.name }), /* @__PURE__ */ jsx("div", {
										className: "text-[11px] text-slate-400",
										children: act.activity_date
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono text-slate-600 dark:text-slate-400",
									children: act.loading_start_time ? new Date(act.loading_start_time).toLocaleTimeString("id-ID", {
										hour: "2-digit",
										minute: "2-digit"
									}) : "-"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono text-slate-600 dark:text-slate-400",
									children: act.hauling_start_time ? new Date(act.hauling_start_time).toLocaleTimeString("id-ID", {
										hour: "2-digit",
										minute: "2-digit"
									}) : "-"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono text-slate-600 dark:text-slate-400",
									children: act.dumping_time ? new Date(act.dumping_time).toLocaleTimeString("id-ID", {
										hour: "2-digit",
										minute: "2-digit"
									}) : "-"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4",
									children: getJourneyBadge(act.journey_status)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4",
									children: act.delay_type ? /* @__PURE__ */ jsxs("div", {
										className: "text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1",
										children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-3 h-3" }), /* @__PURE__ */ jsxs("span", { children: [
											act.delay_type,
											" (",
											act.delay_duration_minutes,
											"m)"
										] })]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-slate-400 text-[11px]",
										children: "Lancar"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-right",
									children: /* @__PURE__ */ jsx(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => openStatusModal(act),
										children: "Update Status"
									})
								})
							]
						}, act.id))
					})]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "p-4 border-t border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx(Pagination, { links: activities.links })
			})]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Catat Aktivitas Loading & Hauling",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreateSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Pilih Unit DT"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.unit_id,
							onChange: (e) => createForm.setData("unit_id", e.target.value),
							options: master.units?.map((u) => ({
								value: u.id,
								label: u.unit_code
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Driver"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.driver_id,
							onChange: (e) => createForm.setData("driver_id", e.target.value),
							options: master.drivers?.map((d) => ({
								value: d.id,
								label: `${d.employee?.name} (${d.driver_code})`
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Loading Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.loading_point_id,
							onChange: (e) => createForm.setData("loading_point_id", e.target.value),
							options: master.loading_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Dumping Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.dumping_point_id,
							onChange: (e) => createForm.setData("dumping_point_id", e.target.value),
							options: master.dumping_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Material"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.material_id,
							onChange: (e) => createForm.setData("material_id", e.target.value),
							options: master.materials?.map((m) => ({
								value: m.id,
								label: m.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Shift"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.shift_id,
							onChange: (e) => createForm.setData("shift_id", e.target.value),
							options: master.shifts?.map((s) => ({
								value: s.id,
								label: s.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Perjalanan"
					}), /* @__PURE__ */ jsx(Select, {
						value: createForm.data.journey_status,
						onChange: (e) => createForm.setData("journey_status", e.target.value),
						options: [
							{
								value: "loading",
								label: "Loading di Front"
							},
							{
								value: "hauling",
								label: "Hauling (Berjalan)"
							},
							{
								value: "queueing_dump",
								label: "Antre Dumping"
							},
							{
								value: "dumped",
								label: "Selesai Dumping"
							}
						]
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: createForm.processing,
							children: "Simpan Aktivitas"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isUpdateStatusOpen,
			onClose: () => setIsUpdateStatusOpen(false),
			title: `Update Status: Unit ${selectedActivity?.unit?.unit_code}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleStatusSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Baru"
					}), /* @__PURE__ */ jsx(Select, {
						value: statusForm.data.journey_status,
						onChange: (e) => statusForm.setData("journey_status", e.target.value),
						options: [
							{
								value: "loading",
								label: "Loading di Front"
							},
							{
								value: "hauling",
								label: "Hauling (Mulai Berjalan)"
							},
							{
								value: "queueing_dump",
								label: "Antre Dumping di Stockpile/Jetty"
							},
							{
								value: "dumped",
								label: "Selesai Dumping"
							},
							{
								value: "returning",
								label: "Kosongan Balik ke Front"
							},
							{
								value: "delay_breakdown",
								label: "Kendala: Breakdown Unit"
							},
							{
								value: "delay_weather",
								label: "Kendala: Hujan / Licin"
							},
							{
								value: "delay_road",
								label: "Kendala: Insiden Jalur"
							}
						],
						required: true
					})] }),
					statusForm.data.journey_status.startsWith("delay") && /* @__PURE__ */ jsxs("div", {
						className: "p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1",
								children: "Tipe Kendala"
							}), /* @__PURE__ */ jsx(Input, {
								value: statusForm.data.delay_type,
								onChange: (e) => statusForm.setData("delay_type", e.target.value),
								placeholder: "Misal: Pecah Ban, Amblas, Hujan Deras"
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1",
								children: "Estimasi Durasi (Menit)"
							}), /* @__PURE__ */ jsx(Input, {
								type: "number",
								min: 0,
								value: statusForm.data.delay_duration_minutes,
								onChange: (e) => statusForm.setData("delay_duration_minutes", e.target.value)
							})] })]
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-rose-800 dark:text-rose-200 mb-1",
							children: "Keterangan Kendala"
						}), /* @__PURE__ */ jsx("textarea", {
							value: statusForm.data.delay_notes,
							onChange: (e) => statusForm.setData("delay_notes", e.target.value),
							className: "w-full text-xs rounded-lg border-rose-300 dark:border-rose-700 dark:bg-slate-800 p-2",
							rows: 2,
							placeholder: "Detail titik KM atau tindak lanjut mekanik..."
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsUpdateStatusOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: statusForm.processing,
							children: "Perbarui Status"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Production/Import/Index.jsx
var Index_exports$9 = /* @__PURE__ */ __exportAll({ default: () => ImportIndex });
function ImportIndex({ batches = { data: [] } }) {
	const [file, setFile] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [previewData, setPreviewData] = useState(null);
	const [isExecuting, setIsExecuting] = useState(false);
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setPreviewData(null);
		}
	};
	const handlePreview = async (e) => {
		e.preventDefault();
		if (!file) return;
		setIsUploading(true);
		const formData = new FormData();
		formData.append("file", file);
		try {
			const res = await fetch("/production/import/preview", {
				method: "POST",
				headers: {
					"X-CSRF-TOKEN": document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") || "",
					"Accept": "application/json"
				},
				body: formData
			});
			const data = await res.json();
			if (res.ok && data.success) setPreviewData(data);
			else alert(data.message || "Gagal memproses file. Pastikan format kolom sesuai template.");
		} catch (err) {
			alert("Terjadi kesalahan saat mengunggah file: " + err.message);
		} finally {
			setIsUploading(false);
		}
	};
	const handleExecuteImport = () => {
		if (!previewData || !previewData.rows) return;
		setIsExecuting(true);
		router.post("/production/import/execute", {
			file_name: previewData.file_name,
			rows: previewData.rows
		}, {
			onSuccess: () => {
				setFile(null);
				setPreviewData(null);
				setIsExecuting(false);
			},
			onError: () => {
				setIsExecuting(false);
			}
		});
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Bulk Import Tiket Dumping — TAP Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-teal-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(UploadCloud, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Bulk Import Tiket Dumping (Excel / CSV)"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Unggah massal rekap tiket timbangan JSI dengan validasi duplikasi, master data, dan preview interaktif"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs("a", {
					href: "/production/import/template",
					className: "inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition",
					children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 mr-2 text-indigo-600" }), "Unduh Template CSV"]
				})
			})]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-6 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handlePreview,
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30",
					children: [
						/* @__PURE__ */ jsx(FileSpreadsheet, { className: "w-12 h-12 text-slate-400 mx-auto mb-3" }),
						/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-bold text-slate-800 dark:text-slate-200",
							children: file ? file.name : "Pilih atau Drag & Drop Berkas CSV / Excel (.xlsx)"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-500 dark:text-slate-400 mt-1",
							children: "Maksimal ukuran file 10MB. File wajib memiliki kolom: ticket_number, ticket_date, dumping_time, unit_code, driver_code, dsb."
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-4",
							children: /* @__PURE__ */ jsxs("label", {
								className: "cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm",
								children: [/* @__PURE__ */ jsx("span", { children: "Pilih Berkas Komputer" }), /* @__PURE__ */ jsx("input", {
									type: "file",
									accept: ".csv,.txt,.xlsx",
									onChange: handleFileChange,
									className: "hidden"
								})]
							})
						})
					]
				}), file && /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between pt-2",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-slate-600 dark:text-slate-300 font-medium",
						children: [
							"File terpilih: ",
							/* @__PURE__ */ jsx("strong", { children: file.name }),
							" (",
							(file.size / 1024).toFixed(1),
							" KB)"
						]
					}), /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						disabled: isUploading,
						children: [/* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${isUploading ? "animate-spin" : ""}` }), isUploading ? "Memvalidasi Berkas..." : "Proses & Tampilkan Preview"]
					})]
				})]
			})
		}),
		previewData && /* @__PURE__ */ jsxs(Card, {
			className: "p-5 mb-6 border-2 border-indigo-500/40",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h2", {
						className: "text-base font-bold text-slate-900 dark:text-white flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx(Database, { className: "w-4 h-4 text-indigo-600" }),
							"Hasil Validasi Preview: ",
							previewData.file_name
						]
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-500",
						children: "Periksa baris data sebelum menyimpannya ke database produksi."
					})] }), /* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ jsxs(Button, {
							onClick: handleExecuteImport,
							disabled: isExecuting || previewData.summary.valid_count === 0,
							className: "bg-emerald-600 hover:bg-emerald-700",
							children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), isExecuting ? "Menyimpan ke Database..." : `Simpan ${previewData.summary.valid_count} Baris Valid`]
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Total Baris File"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-slate-900 dark:text-white",
								children: previewData.summary.total_rows
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block",
								children: "Baris Valid (Siap Simpan)"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-emerald-600",
								children: previewData.summary.valid_count
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-xs text-amber-800 dark:text-amber-300",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block",
								children: "Tiket Duplikat Dideteksi"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-amber-600",
								children: previewData.summary.duplicate_count
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block",
								children: "Baris Gagal / Error"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-lg font-bold text-rose-600",
								children: previewData.summary.error_count
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto max-h-96",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold sticky top-0",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Baris"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "No. Tiket"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Tanggal & Jam"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Unit"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Driver"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Tonase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Shift"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Validasi"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-2.5 px-3",
									children: "Keterangan Error"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: previewData.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
								className: row.is_valid ? "hover:bg-slate-50 dark:hover:bg-slate-800/40" : "bg-rose-50/50 dark:bg-rose-950/20",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3 font-mono font-bold text-slate-400",
										children: row.row_number
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3 font-mono font-bold text-slate-800 dark:text-slate-200",
										children: row.ticket_number || "-"
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2 px-3 text-slate-600 dark:text-slate-400",
										children: [
											row.ticket_date,
											" ",
											row.dumping_time
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3 font-semibold",
										children: row.unit_code
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3 text-slate-600 dark:text-slate-400",
										children: row.driver_code
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-2 px-3 font-bold text-emerald-600",
										children: [row.tonnage, " T"]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3",
										children: row.shift_code
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3",
										children: row.is_valid ? /* @__PURE__ */ jsx(Badge, {
											variant: "success",
											children: "Valid"
										}) : /* @__PURE__ */ jsx(Badge, {
											variant: "danger",
											children: "Gagal"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-2 px-3 text-rose-600 text-[11px]",
										children: row.errors?.join("; ") || "-"
									})
								]
							}, row.row_number))
						})]
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-base font-bold text-slate-900 dark:text-white",
						children: "Riwayat Batch Bulk Import"
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Kode Batch"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Nama Berkas"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Total Baris"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Berhasil"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Duplikat"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Gagal"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Diimpor Oleh"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Waktu"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: batches.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: "8",
								className: "py-6 text-center text-slate-400",
								children: "Belum ada riwayat berkas bulk import."
							}) }) : batches.data.map((b) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400",
										children: b.batch_code
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-medium text-slate-800 dark:text-slate-200",
										children: b.file_name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: b.total_rows
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center text-emerald-600 font-bold",
										children: b.successful_rows
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center text-amber-600 font-bold",
										children: b.duplicate_rows
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center text-rose-600 font-bold",
										children: b.failed_rows
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-600 dark:text-slate-300",
										children: b.user?.name || "Sistem"
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-400 font-mono text-[11px]",
										children: b.created_at
									})
								]
							}, b.id))
						})]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-t border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx(Pagination, { links: batches.links })
				})
			]
		})
	] });
}
// resources/js/Pages/Production/Recap/Index.jsx
var Index_exports$8 = /* @__PURE__ */ __exportAll({ default: () => RecapIndex });
function RecapIndex({ filters = {}, summary = {}, by_shift = [], by_unit = [], by_driver = [], by_loading_point = [], by_dumping_point = [], daily_trend = [], weekly_breakdown = [], monthly_breakdown = [], master = {} }) {
	const [activeTab, setActiveTab] = useState("shift");
	const [dateFrom, setDateFrom] = useState(filters.date_from || "");
	const [dateTo, setDateTo] = useState(filters.date_to || "");
	const [shiftId, setShiftId] = useState(filters.shift_id || "");
	const [loadingPointId, setLoadingPointId] = useState(filters.loading_point_id || "");
	const [dumpingPointId, setDumpingPointId] = useState(filters.dumping_point_id || "");
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/recap", {
			date_from: dateFrom,
			date_to: dateTo,
			shift_id: shiftId,
			loading_point_id: loadingPointId,
			dumping_point_id: dumpingPointId
		}, { preserveState: true });
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Rekapitulasi Produksi Resmi — TAP Coal Hauling" }),
		/* @__PURE__ */ jsx("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-purple-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(BarChart3, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Rekapitulasi Produksi Resmi (Verified)"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Perhitungan agregasi ritase & tonase resmi yang telah disetujui (100% data audit verified)"
				})] })]
			}) })
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6",
			children: [
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-purple-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Total Tonase Periode"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-2xl font-black text-slate-900 dark:text-white mt-1",
							children: [Number(summary.total_tonnage || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 }), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-slate-400 ml-1",
								children: "Ton"
							})]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-purple-600 font-medium mt-1 block",
							children: "Tiket Terverifikasi"
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-blue-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Total Ritase Periode"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-2xl font-black text-slate-900 dark:text-white mt-1",
							children: [Number(summary.total_ritase || 0).toLocaleString("id-ID"), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-slate-400 ml-1",
								children: "Rit"
							})]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-blue-600 font-medium mt-1 block",
							children: "Perjalanan Hauling"
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-emerald-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Rata-Rata Muatan"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-2xl font-black text-slate-900 dark:text-white mt-1",
							children: [Number(summary.avg_tonnage_per_rit || 0).toFixed(2), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-slate-400 ml-1",
								children: "Ton / Rit"
							})]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-emerald-600 font-medium mt-1 block",
							children: "Rasio Efisiensi DT"
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-amber-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Produksi Hari Ini"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-2xl font-black text-slate-900 dark:text-white mt-1",
							children: [Number(summary.today_tonnage || 0).toFixed(2), /* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-slate-400 ml-1",
								children: "Ton"
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-amber-600 font-medium mt-1 block",
							children: [
								"(",
								summary.today_ritase || 0,
								" Rit Hari Ini)"
							]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Dari Tanggal"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: dateFrom,
						onChange: (e) => setDateFrom(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Sampai Tanggal"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: dateTo,
						onChange: (e) => setDateTo(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Shift"
					}), /* @__PURE__ */ jsx(Select, {
						value: shiftId,
						onChange: (e) => setShiftId(e.target.value),
						options: [{
							value: "",
							label: "Semua Shift"
						}, ...master.shifts?.map((s) => ({
							value: s.id,
							label: s.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Loading Point"
					}), /* @__PURE__ */ jsx(Select, {
						value: loadingPointId,
						onChange: (e) => setLoadingPointId(e.target.value),
						options: [{
							value: "",
							label: "Semua Loading"
						}, ...master.loading_points?.map((l) => ({
							value: l.id,
							label: l.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Dumping Point"
					}), /* @__PURE__ */ jsx(Select, {
						value: dumpingPointId,
						onChange: (e) => setDumpingPointId(e.target.value),
						options: [{
							value: "",
							label: "Semua Dumping"
						}, ...master.dumping_points?.map((d) => ({
							value: d.id,
							label: d.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Hitung Rekap"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-2 overflow-x-auto",
			children: [
				/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("shift"),
					className: `px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === "shift" ? "border-purple-600 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-700"}`,
					children: [/* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }), "Per Shift Kerja"]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("unit"),
					className: `px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === "unit" ? "border-purple-600 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-700"}`,
					children: [/* @__PURE__ */ jsx(Truck, { className: "w-4 h-4" }), "Per Armada Unit (DT)"]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("driver"),
					className: `px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === "driver" ? "border-purple-600 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-700"}`,
					children: [/* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }), "Per Driver"]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("route"),
					className: `px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === "route" ? "border-purple-600 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-700"}`,
					children: [/* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }), "Per Titik Loading & Dumping"]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => setActiveTab("weekly_monthly"),
					className: `px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${activeTab === "weekly_monthly" ? "border-purple-600 text-purple-600 dark:text-purple-400" : "border-transparent text-slate-500 hover:text-slate-700"}`,
					children: [/* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" }), "Mingguan & Bulanan"]
				})
			]
		}),
		activeTab === "shift" && /* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "p-4 border-b border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx("h2", {
					className: "text-sm font-bold text-slate-900 dark:text-white",
					children: "Rekapitulasi Produksi Berdasarkan Shift"
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Nama Shift"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Total Ritase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Total Tonase Resmi"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Rata-Rata Tonase / Rit"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Kontribusi (%)"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: by_shift.map((s, idx) => {
							const pct = summary.total_tonnage > 0 ? (s.total_tonnage / summary.total_tonnage * 100).toFixed(1) : 0;
							const avg = s.ritase > 0 ? (s.total_tonnage / s.ritase).toFixed(2) : 0;
							return /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-slate-800 dark:text-slate-200",
										children: s.shift_name
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: [s.ritase, " Rit"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-black text-purple-600 dark:text-purple-400",
										children: [Number(s.total_tonnage).toFixed(2), " Ton"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right text-slate-600 dark:text-slate-300",
										children: [avg, " Ton"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-200",
										children: [pct, "%"]
									})
								]
							}, idx);
						})
					})]
				})
			})]
		}),
		activeTab === "unit" && /* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "p-4 border-b border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx("h2", {
					className: "text-sm font-bold text-slate-900 dark:text-white",
					children: "Rekapitulasi Produksi Berdasarkan Armada Dump Truck"
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "#"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "No. Lambung"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Tipe Armada"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Total Ritase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Total Tonase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Rata-Rata Ton / Rit"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: by_unit.map((u, idx) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-slate-400 font-bold",
									children: idx + 1
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Truck, { className: "w-3.5 h-3.5 text-slate-400" }), u.unit_code]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-slate-500",
									children: u.unit_type === "dump_truck_10" ? "DT 10 Roda" : u.unit_type === "dump_truck_12" ? "DT 12 Roda" : u.unit_type
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-center font-semibold",
									children: [u.ritase, " Rit"]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400",
									children: [Number(u.total_tonnage).toFixed(2), " Ton"]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right text-slate-600 dark:text-slate-300",
									children: [Number(u.avg_tonnage).toFixed(2), " Ton"]
								})
							]
						}, idx))
					})]
				})
			})]
		}),
		activeTab === "driver" && /* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "p-4 border-b border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx("h2", {
					className: "text-sm font-bold text-slate-900 dark:text-white",
					children: "Rekapitulasi Produksi Berdasarkan Driver Hauling"
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "#"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Nama Driver"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "ID Driver"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Total Ritase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Total Tonase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Rata-Rata Ton / Rit"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: by_driver.map((d, idx) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-slate-400 font-bold",
									children: idx + 1
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-bold text-slate-900 dark:text-white",
									children: d.driver_name
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono text-slate-500",
									children: d.driver_code
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-center font-semibold",
									children: [d.ritase, " Rit"]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right font-black text-purple-600 dark:text-purple-400",
									children: [Number(d.total_tonnage).toFixed(2), " Ton"]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right text-slate-600 dark:text-slate-300",
									children: [Number(d.avg_tonnage).toFixed(2), " Ton"]
								})
							]
						}, idx))
					})]
				})
			})]
		}),
		activeTab === "route" && /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold text-slate-900 dark:text-white",
						children: "Per Loading Point (Front / Pit)"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Lokasi Loading"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Total Tonase"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: by_loading_point.map((l, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-slate-800 dark:text-slate-200",
										children: l.loading_name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: l.ritase
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-bold text-emerald-600",
										children: [Number(l.total_tonnage).toFixed(2), " T"]
									})
								]
							}, idx))
						})]
					})
				})]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold text-slate-900 dark:text-white",
						children: "Per Dumping Point (Stockpile / Jetty)"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Lokasi Dumping"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Total Tonase"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: by_dumping_point.map((d, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold text-slate-800 dark:text-slate-200",
										children: d.dumping_name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: d.ritase
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-bold text-blue-600",
										children: [Number(d.total_tonnage).toFixed(2), " T"]
									})
								]
							}, idx))
						})]
					})
				})]
			})]
		}),
		activeTab === "weekly_monthly" && /* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-6",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold text-slate-900 dark:text-white",
						children: "Produksi Mingguan (Weekly Recap)"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Periode Minggu"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Tonase Resmi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: weekly_breakdown.map((w, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 font-semibold text-slate-800 dark:text-slate-200",
										children: [
											w.start_of_week,
											" s/d ",
											w.end_of_week
										]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: [w.ritase, " Rit"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-black text-purple-600",
										children: [Number(w.total_tonnage).toFixed(2), " Ton"]
									})
								]
							}, idx))
						})]
					})
				})]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold text-slate-900 dark:text-white",
						children: "Produksi Bulanan (Monthly Recap)"
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Bulan (YYYY-MM)"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Tonase Resmi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: monthly_breakdown.map((m, idx) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200",
										children: m.month_year
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: [m.ritase, " Rit"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-black text-emerald-600",
										children: [Number(m.total_tonnage).toFixed(2), " Ton"]
									})
								]
							}, idx))
						})]
					})
				})]
			})]
		})
	] });
}
// resources/js/Pages/Production/Reconciliation/Detail.jsx
var Detail_exports = /* @__PURE__ */ __exportAll({ default: () => ReconciliationDetail });
function ReconciliationDetail({ reconciliation = {}, items = { data: [] }, filters = {}, counts = {} }) {
	const [selectedItem, setSelectedItem] = useState(null);
	const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
	const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
	const resolveForm = useForm({
		resolution_status: "resolved_accept_tap",
		resolution_notes: ""
	});
	const settleForm = useForm({
		status: "settled",
		settlement_notes: reconciliation.settlement_notes || ""
	});
	const handleFilterStatus = (status) => {
		router.get(`/production/reconciliation/${reconciliation.id}`, { match_status: status }, { preserveState: true });
	};
	const openResolveModal = (item) => {
		setSelectedItem(item);
		resolveForm.setData({
			resolution_status: item.resolution_status || "resolved_accept_tap",
			resolution_notes: item.resolution_notes || ""
		});
		setIsResolveModalOpen(true);
	};
	const handleResolveSubmit = (e) => {
		e.preventDefault();
		if (!selectedItem) return;
		resolveForm.put(`/production/reconciliation/items/${selectedItem.id}`, { onSuccess: () => {
			setIsResolveModalOpen(false);
			resolveForm.reset();
		} });
	};
	const handleSettleSubmit = (e) => {
		e.preventDefault();
		settleForm.post(`/production/reconciliation/${reconciliation.id}/settle`, { onSuccess: () => {
			setIsSettleModalOpen(false);
		} });
	};
	const getMatchBadge = (status) => {
		switch (status) {
			case "match": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Cocok (Match)"
			});
			case "tonnage_diff": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "Selisih Tonase"
			});
			case "unit_diff": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "Beda Unit"
			});
			case "missing_in_tap": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Tidak Ada di TAP"
			});
			case "missing_in_jsi": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Tidak Ada di JSI"
			});
			case "duplicate": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Tiket Duplikat"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	const getResolutionBadge = (status) => {
		switch (status) {
			case "resolved_accept_tap": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Disetujui TAP"
			});
			case "resolved_accept_jsi": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				children: "Disetujui JSI"
			});
			case "resolved_adjusted": return /* @__PURE__ */ jsx(Badge, {
				variant: "info",
				children: "Disesuaikan"
			});
			case "ignored": return /* @__PURE__ */ jsx(Badge, {
				variant: "secondary",
				children: "Diabaikan"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				children: "Belum Diselesaikan"
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: `Rekonsiliasi ${reconciliation.reconciliation_code} — TAP` }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs(Link, {
				href: "/production/reconciliation",
				className: "inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "w-3.5 h-3.5 mr-1" }), "Kembali ke Daftar Rekonsiliasi"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-rose-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(Scale, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2",
					children: [
						"Detail Rekonsiliasi: ",
						reconciliation.reconciliation_code,
						/* @__PURE__ */ jsx(Badge, {
							variant: reconciliation.status === "settled" ? "success" : "warning",
							children: reconciliation.status.toUpperCase()
						})
					]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: [
						"Site: ",
						/* @__PURE__ */ jsx("strong", { children: reconciliation.site?.name }),
						" • Periode: ",
						/* @__PURE__ */ jsxs("strong", { children: [
							reconciliation.start_date,
							" s/d ",
							reconciliation.end_date
						] }),
						" • File: ",
						/* @__PURE__ */ jsx("strong", { children: reconciliation.source_file_name || "-" })
					]
				})] })]
			})] }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsSettleModalOpen(true),
					className: "bg-emerald-600 hover:bg-emerald-700",
					children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), "Selesaikan Rekonsiliasi"]
				})
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6",
			children: [
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-blue-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Total Tiket TAP"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-xl font-black text-slate-900 dark:text-white mt-1",
							children: [reconciliation.total_tap_tickets, " Tiket"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 mt-1 block",
							children: ["Tonase: ", /* @__PURE__ */ jsxs("strong", { children: [Number(reconciliation.total_tap_tonnage).toFixed(2), " Ton"] })]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-purple-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-slate-500 uppercase",
							children: "Total Tiket JSI"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-xl font-black text-slate-900 dark:text-white mt-1",
							children: [reconciliation.total_jsi_tickets, " Tiket"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-slate-500 mt-1 block",
							children: ["Tonase: ", /* @__PURE__ */ jsxs("strong", { children: [Number(reconciliation.total_jsi_tonnage).toFixed(2), " Ton"] })]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-emerald-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase",
							children: "Tiket Cocok (Match)"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-xl font-black text-emerald-600 mt-1",
							children: [reconciliation.matched_tickets_count, " Tiket"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-emerald-600 mt-1 block",
							children: [Number(reconciliation.matched_tonnage).toFixed(2), " Ton Klop"]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Card, {
					className: "p-4 border-l-4 border-l-rose-500",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase",
							children: "Tiket Selisih (Discrepant)"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-xl font-black text-rose-600 mt-1",
							children: [(reconciliation.discrepancy_tickets_count || 0) + (reconciliation.missing_in_tap_count || 0), " Tiket"]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "text-xs text-rose-600 mt-1 block",
							children: [
								"Selisih: ",
								Number(reconciliation.discrepancy_tonnage).toFixed(2),
								" Ton"
							]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "flex gap-2 mb-4 overflow-x-auto pb-1",
			children: [
				/* @__PURE__ */ jsxs("button", {
					onClick: () => handleFilterStatus("all"),
					className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === "all" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`,
					children: [
						"Semua Baris (",
						counts.all,
						")"
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => handleFilterStatus("match"),
					className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === "match" ? "bg-emerald-600 text-white" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"}`,
					children: [
						"Cocok (",
						counts.match,
						")"
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => handleFilterStatus("tonnage_diff"),
					className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === "tonnage_diff" ? "bg-amber-600 text-white" : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"}`,
					children: [
						"Selisih Tonase (",
						counts.tonnage_diff,
						")"
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => handleFilterStatus("missing_in_tap"),
					className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === "missing_in_tap" ? "bg-rose-600 text-white" : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"}`,
					children: [
						"Tidak Ada di TAP (",
						counts.missing_in_tap,
						")"
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => handleFilterStatus("missing_in_jsi"),
					className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${filters.match_status === "missing_in_jsi" ? "bg-purple-600 text-white" : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"}`,
					children: [
						"Tidak Ada di JSI (",
						counts.missing_in_jsi,
						")"
					]
				})
			]
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "No. Tiket TAP"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "No. Tiket JSI"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Unit (TAP / JSI)"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Tonase TAP"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Tonase JSI"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Selisih Tonase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Kategori Cocok"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Status Penyelesaian"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Aksi"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: items.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: "9",
							className: "py-8 text-center text-slate-400",
							children: "Tidak ada baris rekonsiliasi pada kategori ini."
						}) }) : items.data.map((item) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono font-bold text-slate-900 dark:text-white",
									children: item.tap_ticket_number || /* @__PURE__ */ jsx("span", {
										className: "text-slate-400 italic",
										children: "Tidak ada"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono text-slate-700 dark:text-slate-300",
									children: item.jsi_ticket_number || /* @__PURE__ */ jsx("span", {
										className: "text-slate-400 italic",
										children: "Tidak ada"
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-center",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "font-semibold text-slate-800 dark:text-slate-200",
											children: item.tap_unit_code || "-"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-slate-400 mx-1",
											children: "/"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "text-slate-500",
											children: item.jsi_unit_code || "-"
										})
									]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right font-semibold",
									children: [Number(item.tap_tonnage).toFixed(2), " T"]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right font-semibold text-purple-600 dark:text-purple-400",
									children: [Number(item.jsi_tonnage).toFixed(2), " T"]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-right font-black",
									children: Math.abs(item.tonnage_diff) > 0 ? /* @__PURE__ */ jsxs("span", {
										className: "text-rose-600 dark:text-rose-400",
										children: [Number(item.tonnage_diff).toFixed(2), " T"]
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-emerald-600",
										children: "0.00 T"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: getMatchBadge(item.match_status)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: getResolutionBadge(item.resolution_status)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-right",
									children: /* @__PURE__ */ jsx(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => openResolveModal(item),
										children: "Penyelesaian"
									})
								})
							]
						}, item.id))
					})]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "p-4 border-t border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx(Pagination, { links: items.links })
			})]
		}),
		reconciliation.settlement_notes && /* @__PURE__ */ jsxs(Card, {
			className: "p-4 mt-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1",
				children: "Catatan Penyelesaian Rekonsiliasi (Settlement Notes):"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-xs text-slate-600 dark:text-slate-300",
				children: reconciliation.settlement_notes
			})]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isResolveModalOpen,
			onClose: () => setIsResolveModalOpen(false),
			title: `Penyelesaian Selisih Tiket: ${selectedItem?.tap_ticket_number || selectedItem?.jsi_ticket_number}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleResolveSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500",
									children: "Tonase TAP:"
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-bold",
									children: [selectedItem?.tap_tonnage, " Ton"]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500",
									children: "Tonase JSI:"
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-bold text-purple-600",
									children: [selectedItem?.jsi_tonnage, " Ton"]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-slate-500",
									children: "Selisih Tonase:"
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-black text-rose-600",
									children: [selectedItem?.tonnage_diff, " Ton"]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Keputusan Penyelesaian"
					}), /* @__PURE__ */ jsx(Select, {
						value: resolveForm.data.resolution_status,
						onChange: (e) => resolveForm.setData("resolution_status", e.target.value),
						options: [
							{
								value: "resolved_accept_tap",
								label: "Disetujui: Menggunakan Angka Timbangan TAP"
							},
							{
								value: "resolved_accept_jsi",
								label: "Disetujui: Menggunakan Angka Timbangan JSI"
							},
							{
								value: "resolved_adjusted",
								label: "Disesuaikan Bersama (Adjusted Berita Acara)"
							},
							{
								value: "ignored",
								label: "Diabaikan (Tiket Void/Batal)"
							}
						],
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Catatan Berita Acara / Alasan Keputusan"
					}), /* @__PURE__ */ jsx("textarea", {
						value: resolveForm.data.resolution_notes,
						onChange: (e) => resolveForm.setData("resolution_notes", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5",
						rows: 3,
						placeholder: "Keterangan hasil konfirmasi dengan checker JSI atau print out struk...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsResolveModalOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: resolveForm.processing,
							children: "Simpan Penyelesaian"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isSettleModalOpen,
			onClose: () => setIsSettleModalOpen(false),
			title: "Finalisasi & Selesaikan Rekonsiliasi",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleSettleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Status Final"
					}), /* @__PURE__ */ jsx(Select, {
						value: settleForm.data.status,
						onChange: (e) => settleForm.setData("status", e.target.value),
						options: [{
							value: "settled",
							label: "Settled (Selesai Sepakat)"
						}, {
							value: "disputed",
							label: "Disputed (Masih Berselisih / Butuh Klarifikasi Direksi)"
						}],
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Catatan Kesepakatan Final (Settlement Notes)"
					}), /* @__PURE__ */ jsx("textarea", {
						value: settleForm.data.settlement_notes,
						onChange: (e) => settleForm.setData("settlement_notes", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5",
						rows: 3,
						placeholder: "Catatan penutupan rekonsiliasi antara TAP dan pihak JSI...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsSettleModalOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: settleForm.processing,
							children: "Konfirmasi Selesai"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Production/Reconciliation/Index.jsx
var Index_exports$7 = /* @__PURE__ */ __exportAll({ default: () => ReconciliationIndex });
function ReconciliationIndex({ reconciliations = { data: [] }, filters = {}, sites = [] }) {
	const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
	const [selectedSite, setSelectedSite] = useState(filters.site_id || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const form = useForm({
		site_id: sites[0]?.id || "",
		start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		end_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		jsi_file: null
	});
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/reconciliation", {
			status: selectedStatus,
			site_id: selectedSite
		}, { preserveState: true });
	};
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		form.post("/production/reconciliation", { onSuccess: () => {
			setIsCreateOpen(false);
			form.reset();
		} });
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "settled": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Selesai (Settled)"
			});
			case "in_review": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "Dalam Review"
			});
			case "disputed": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Dispute (Selisih)"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Rekonsiliasi Tiket TAP vs JSI — Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-rose-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(Scale, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Rekonsiliasi Tiket TAP vs JSI"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Fasilitas pencocokan otomatis antara data tiket timbangan TAP dengan rekapan eksternal JSI"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsCreateOpen(true),
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }), "Mulai Rekonsiliasi Baru"]
				})
			})]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Site Proyek"
					}), /* @__PURE__ */ jsx(Select, {
						value: selectedSite,
						onChange: (e) => setSelectedSite(e.target.value),
						options: [{
							value: "",
							label: "Semua Site"
						}, ...sites.map((s) => ({
							value: s.id,
							label: s.name
						}))]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Status Rekonsiliasi"
					}), /* @__PURE__ */ jsx(Select, {
						value: selectedStatus,
						onChange: (e) => setSelectedStatus(e.target.value),
						options: [
							{
								value: "",
								label: "Semua Status"
							},
							{
								value: "in_review",
								label: "Dalam Review"
							},
							{
								value: "settled",
								label: "Selesai (Settled)"
							},
							{
								value: "disputed",
								label: "Dispute / Selisih"
							}
						]
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Terapkan Filter"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Kode Rekonsiliasi"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Site Tambang"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Periode Tanggal"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Tiket TAP vs JSI"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Tonase TAP vs JSI"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Cocok"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Selisih"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Aksi"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: reconciliations.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: "9",
							className: "py-8 text-center text-slate-400",
							children: "Belum ada riwayat rekonsiliasi. Klik \"Mulai Rekonsiliasi Baru\" untuk mencocokkan data."
						}) }) : reconciliations.data.map((rec) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400",
									children: rec.reconciliation_code
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-semibold text-slate-800 dark:text-slate-200",
									children: rec.site?.name
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-slate-600 dark:text-slate-400",
									children: [
										rec.start_date,
										" s/d ",
										rec.end_date
									]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300",
									children: [
										rec.total_tap_tickets,
										" / ",
										rec.total_jsi_tickets
									]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "font-bold text-slate-900 dark:text-white",
										children: [Number(rec.total_tap_tonnage).toFixed(1), " T"]
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-[11px] text-slate-400",
										children: [
											"JSI: ",
											Number(rec.total_jsi_tonnage).toFixed(1),
											" T"
										]
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: /* @__PURE__ */ jsx("span", {
										className: "font-bold text-emerald-600",
										children: rec.matched_tickets_count
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: rec.discrepancy_tickets_count > 0 || rec.missing_in_tap_count > 0 ? /* @__PURE__ */ jsx("span", {
										className: "font-bold text-rose-600",
										children: (rec.discrepancy_tickets_count || 0) + (rec.missing_in_tap_count || 0)
									}) : /* @__PURE__ */ jsx("span", {
										className: "text-slate-400",
										children: "0"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: getStatusBadge(rec.status)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-right",
									children: /* @__PURE__ */ jsxs(Link, {
										href: `/production/reconciliation/${rec.id}`,
										className: "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition",
										children: [/* @__PURE__ */ jsx(Eye, { className: "w-3.5 h-3.5 mr-1" }), "Detail"]
									})
								})
							]
						}, rec.id))
					})]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "p-4 border-t border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx(Pagination, { links: reconciliations.links })
			})]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Mulai Rekonsiliasi Tiket TAP vs JSI",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreateSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Site Proyek"
					}), /* @__PURE__ */ jsx(Select, {
						value: form.data.site_id,
						onChange: (e) => form.setData("site_id", e.target.value),
						options: sites.map((s) => ({
							value: s.id,
							label: s.name
						})),
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Dari Tanggal"
						}), /* @__PURE__ */ jsx(Input, {
							type: "date",
							value: form.data.start_date,
							onChange: (e) => form.setData("start_date", e.target.value),
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Sampai Tanggal"
						}), /* @__PURE__ */ jsx(Input, {
							type: "date",
							value: form.data.end_date,
							onChange: (e) => form.setData("end_date", e.target.value),
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Berkas Rekapitulasi JSI (Excel .xlsx / CSV)"
					}), /* @__PURE__ */ jsxs("div", {
						className: "border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-800/40",
						children: [/* @__PURE__ */ jsx("input", {
							type: "file",
							accept: ".csv,.xlsx",
							onChange: (e) => form.setData("jsi_file", e.target.files[0]),
							className: "text-xs text-slate-600 dark:text-slate-300"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-slate-400 mt-1",
							children: "Jika file tidak diunggah, sistem akan memvalidasi kelengkapan tiket TAP pada rentang tanggal tersebut."
						})]
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: form.processing,
							children: "Jalankan Rekonsiliasi"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Production/Targets/Index.jsx
var Index_exports$6 = /* @__PURE__ */ __exportAll({ default: () => TargetsIndex });
function TargetsIndex({ filters = {}, daily_kpi = {}, monthly_kpi = {}, targets_list = { data: [] }, sites = [] }) {
	const [selectedSite, setSelectedSite] = useState(filters.site_id || "");
	const [selectedYear, setSelectedYear] = useState(filters.year || (/* @__PURE__ */ new Date()).getFullYear());
	const [selectedMonth, setSelectedMonth] = useState(filters.month || (/* @__PURE__ */ new Date()).getMonth() + 1);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const form = useForm({
		site_id: filters.site_id || sites[0]?.id || "",
		period_type: "daily",
		target_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		month: (/* @__PURE__ */ new Date()).getMonth() + 1,
		year: (/* @__PURE__ */ new Date()).getFullYear(),
		target_tonnage: "",
		target_ritase: "",
		working_days: 30,
		remarks: ""
	});
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/targets", {
			site_id: selectedSite,
			year: selectedYear,
			month: selectedMonth
		}, { preserveState: true });
	};
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		form.post("/production/targets", { onSuccess: () => {
			setIsCreateOpen(false);
			form.reset();
		} });
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Target & Realisasi Produksi — TAP Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-blue-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(Target, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Target & Realisasi Produksi Hauling"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Penetapan target tonase harian & bulanan serta evaluasi pencapaian real-time"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsCreateOpen(true),
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }), "Tetapkan Target Baru"]
				})
			})]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-4 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Site Tambang"
					}), /* @__PURE__ */ jsx(Select, {
						value: selectedSite,
						onChange: (e) => setSelectedSite(e.target.value),
						options: sites.map((s) => ({
							value: s.id,
							label: s.name
						}))
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Tahun"
					}), /* @__PURE__ */ jsx(Input, {
						type: "number",
						value: selectedYear,
						onChange: (e) => setSelectedYear(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Bulan"
					}), /* @__PURE__ */ jsx(Select, {
						value: selectedMonth,
						onChange: (e) => setSelectedMonth(e.target.value),
						options: [
							{
								value: 1,
								label: "Januari"
							},
							{
								value: 2,
								label: "Februari"
							},
							{
								value: 3,
								label: "Maret"
							},
							{
								value: 4,
								label: "April"
							},
							{
								value: 5,
								label: "Mei"
							},
							{
								value: 6,
								label: "Juni"
							},
							{
								value: 7,
								label: "Juli"
							},
							{
								value: 8,
								label: "Agustus"
							},
							{
								value: 9,
								label: "September"
							},
							{
								value: 10,
								label: "Oktober"
							},
							{
								value: 11,
								label: "November"
							},
							{
								value: 12,
								label: "Desember"
							}
						]
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Terapkan Filter"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6",
			children: [/* @__PURE__ */ jsxs(Card, {
				className: "p-5 border-t-4 border-t-blue-500",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
								children: /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-sm font-bold text-slate-900 dark:text-white",
								children: "Pencapaian Target Harian"
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-slate-400",
								children: ["Tanggal: ", daily_kpi.target_date]
							})] })]
						}), /* @__PURE__ */ jsxs(Badge, {
							variant: daily_kpi.achievement_percent >= 100 ? "success" : "warning",
							children: [daily_kpi.achievement_percent, "% Tercapai"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 block",
								children: "Target Tonase"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xl font-bold text-slate-900 dark:text-white",
								children: [Number(daily_kpi.target_tonnage || 0).toLocaleString("id-ID"), " T"]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-slate-400 block mt-0.5",
								children: [daily_kpi.target_ritase, " Rit Ditargetkan"]
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 block",
									children: "Realisasi (Verified)"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xl font-black text-emerald-600 dark:text-emerald-400",
									children: [Number(daily_kpi.actual_tonnage || 0).toLocaleString("id-ID"), " T"]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-[11px] text-emerald-600 block mt-0.5",
									children: [daily_kpi.actual_ritase, " Rit Tercapai"]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden",
						children: /* @__PURE__ */ jsx("div", {
							className: `h-full rounded-full ${daily_kpi.achievement_percent >= 100 ? "bg-emerald-500" : "bg-blue-500"}`,
							style: { width: `${Math.min(daily_kpi.achievement_percent || 0, 100)}%` }
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-between items-center mt-3 text-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-slate-500",
							children: "Selisih (Variance):"
						}), /* @__PURE__ */ jsx("span", {
							className: `font-bold ${daily_kpi.variance_tonnage >= 0 ? "text-emerald-600" : "text-amber-600"}`,
							children: daily_kpi.variance_tonnage >= 0 ? `+${daily_kpi.variance_tonnage} Ton (Surplus)` : `${daily_kpi.variance_tonnage} Ton (Kurang)`
						})]
					})
				]
			}), /* @__PURE__ */ jsxs(Card, {
				className: "p-5 border-t-4 border-t-purple-500",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between mb-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "p-2 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300",
								children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
								className: "text-sm font-bold text-slate-900 dark:text-white",
								children: "Pencapaian Target Bulanan (RKAB)"
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-slate-400",
								children: [
									"Bulan ",
									monthly_kpi.month,
									" / ",
									monthly_kpi.year
								]
							})] })]
						}), /* @__PURE__ */ jsxs(Badge, {
							variant: monthly_kpi.achievement_percent >= 100 ? "success" : "primary",
							children: [monthly_kpi.achievement_percent, "% Tercapai"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-4 my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-slate-500 block",
								children: "Target Bulanan"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xl font-bold text-slate-900 dark:text-white",
								children: [Number(monthly_kpi.target_tonnage || 0).toLocaleString("id-ID"), " T"]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[11px] text-slate-400 block mt-0.5",
								children: [monthly_kpi.target_ritase, " Rit Ditargetkan"]
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500 block",
									children: "Realisasi Bulanan"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xl font-black text-purple-600 dark:text-purple-400",
									children: [Number(monthly_kpi.actual_tonnage || 0).toLocaleString("id-ID"), " T"]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-[11px] text-purple-600 block mt-0.5",
									children: [monthly_kpi.actual_ritase, " Rit Tercapai"]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden",
						children: /* @__PURE__ */ jsx("div", {
							className: `h-full rounded-full ${monthly_kpi.achievement_percent >= 100 ? "bg-emerald-500" : "bg-purple-500"}`,
							style: { width: `${Math.min(monthly_kpi.achievement_percent || 0, 100)}%` }
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-between items-center mt-3 text-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-slate-500",
							children: "Selisih (Variance):"
						}), /* @__PURE__ */ jsx("span", {
							className: `font-bold ${monthly_kpi.variance_tonnage >= 0 ? "text-emerald-600" : "text-purple-600"}`,
							children: monthly_kpi.variance_tonnage >= 0 ? `+${monthly_kpi.variance_tonnage} Ton` : `${monthly_kpi.variance_tonnage} Ton`
						})]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-b border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx("h2", {
						className: "text-sm font-bold text-slate-900 dark:text-white",
						children: "Daftar Target Operasional Terdaftar"
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tipe Periode"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Tanggal / Bulan"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-right",
									children: "Target Tonase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4 text-center",
									children: "Target Ritase"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Site Tambang"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-4",
									children: "Keterangan"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: targets_list.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
								colSpan: "6",
								className: "py-6 text-center text-slate-400",
								children: "Belum ada target terdaftar pada filter ini."
							}) }) : targets_list.data.map((tgt) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-bold",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: tgt.period_type === "daily" ? "primary" : "outline",
											children: tgt.period_type === "daily" ? "HARIAN" : "BULANAN"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 font-medium text-slate-800 dark:text-slate-200",
										children: tgt.period_type === "daily" ? tgt.target_date : `Bulan ${tgt.month} / ${tgt.year}`
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-right font-black text-slate-900 dark:text-white",
										children: [Number(tgt.target_tonnage).toLocaleString("id-ID"), " Ton"]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-4 text-center font-semibold",
										children: [tgt.target_ritase, " Rit"]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-600 dark:text-slate-300",
										children: tgt.site?.name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-4 text-slate-500",
										children: tgt.remarks || "-"
									})
								]
							}, tgt.id))
						})]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-t border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx(Pagination, { links: targets_list.links })
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Tetapkan Target Produksi Baru",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreateSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Site Proyek"
						}), /* @__PURE__ */ jsx(Select, {
							value: form.data.site_id,
							onChange: (e) => form.setData("site_id", e.target.value),
							options: sites.map((s) => ({
								value: s.id,
								label: s.name
							})),
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Tipe Periode Target"
						}), /* @__PURE__ */ jsx(Select, {
							value: form.data.period_type,
							onChange: (e) => form.setData("period_type", e.target.value),
							options: [{
								value: "daily",
								label: "Target Harian (Daily)"
							}, {
								value: "monthly",
								label: "Target Bulanan (Monthly)"
							}],
							required: true
						})] })]
					}),
					form.data.period_type === "daily" ? /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Tanggal Target"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: form.data.target_date,
						onChange: (e) => form.setData("target_date", e.target.value),
						required: true
					})] }) : /* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Bulan"
						}), /* @__PURE__ */ jsx(Select, {
							value: form.data.month,
							onChange: (e) => form.setData("month", e.target.value),
							options: [
								{
									value: 1,
									label: "Januari"
								},
								{
									value: 2,
									label: "Februari"
								},
								{
									value: 3,
									label: "Maret"
								},
								{
									value: 4,
									label: "April"
								},
								{
									value: 5,
									label: "Mei"
								},
								{
									value: 6,
									label: "Juni"
								},
								{
									value: 7,
									label: "Juli"
								},
								{
									value: 8,
									label: "Agustus"
								},
								{
									value: 9,
									label: "September"
								},
								{
									value: 10,
									label: "Oktober"
								},
								{
									value: 11,
									label: "November"
								},
								{
									value: 12,
									label: "Desember"
								}
							],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Tahun"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							value: form.data.year,
							onChange: (e) => form.setData("year", e.target.value),
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Target Tonase (Ton)"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							step: "0.01",
							min: "0.01",
							value: form.data.target_tonnage,
							onChange: (e) => form.setData("target_tonnage", e.target.value),
							placeholder: "Misal: 15000",
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Target Ritase"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							min: "1",
							value: form.data.target_ritase,
							onChange: (e) => form.setData("target_ritase", e.target.value),
							placeholder: "Misal: 500",
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Keterangan / Parameter Target"
					}), /* @__PURE__ */ jsx("textarea", {
						value: form.data.remarks,
						onChange: (e) => form.setData("remarks", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2",
						rows: 2,
						placeholder: "Catatan asumsi armada, cuaca, dll..."
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: form.processing,
							children: "Simpan Target"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Production/Tickets/Index.jsx
var Index_exports$5 = /* @__PURE__ */ __exportAll({ default: () => TicketIndex });
function TicketIndex({ tickets = { data: [] }, filters = {}, counts = {}, master = {} }) {
	const [search, setSearch] = useState(filters.search || "");
	const [filterStatus, setFilterStatus] = useState(filters.status || "");
	const [filterShift, setFilterShift] = useState(filters.shift_id || "");
	const [dateFrom, setDateFrom] = useState(filters.date_from || "");
	const [dateTo, setDateTo] = useState(filters.date_to || "");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isRejectOpen, setIsRejectOpen] = useState(false);
	const [isCorrectOpen, setIsCorrectOpen] = useState(false);
	const [selectedTicket, setSelectedTicket] = useState(null);
	const createForm = useForm({
		ticket_number: "",
		ticket_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		dumping_time: "12:00",
		site_id: master.sites?.[0]?.id || "",
		unit_id: master.units?.[0]?.id || "",
		driver_id: master.drivers?.[0]?.id || "",
		loading_point_id: master.loading_points?.[0]?.id || "",
		dumping_point_id: master.dumping_points?.[0]?.id || "",
		material_id: master.materials?.[0]?.id || "",
		shift_id: master.shifts?.[0]?.id || "",
		tonnage: "",
		gross_weight: "",
		tare_weight: "",
		checker_name: "Suryadi (JSI Checker)",
		remarks: "",
		attachment: null
	});
	const rejectForm = useForm({ rejection_reason: "" });
	const correctForm = useForm({
		tonnage: "",
		unit_id: "",
		driver_id: "",
		loading_point_id: "",
		dumping_point_id: "",
		material_id: "",
		shift_id: "",
		remarks: "",
		reason: ""
	});
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/tickets", {
			search,
			status: filterStatus,
			shift_id: filterShift,
			date_from: dateFrom,
			date_to: dateTo
		}, { preserveState: true });
	};
	const handleCreateSubmit = (e) => {
		e.preventDefault();
		createForm.post("/production/tickets", { onSuccess: () => {
			setIsCreateOpen(false);
			createForm.reset();
		} });
	};
	const handleVerify = (ticket) => {
		if (confirm(`Verifikasi tiket ${ticket.ticket_number} sebagai data produksi resmi?`)) router.post(`/production/tickets/${ticket.id}/verify`, {}, { preserveScroll: true });
	};
	const openReject = (ticket) => {
		setSelectedTicket(ticket);
		rejectForm.setData({ rejection_reason: "" });
		setIsRejectOpen(true);
	};
	const handleRejectSubmit = (e) => {
		e.preventDefault();
		if (!selectedTicket) return;
		rejectForm.post(`/production/tickets/${selectedTicket.id}/reject`, { onSuccess: () => {
			setIsRejectOpen(false);
			rejectForm.reset();
		} });
	};
	const openCorrect = (ticket) => {
		setSelectedTicket(ticket);
		correctForm.setData({
			tonnage: ticket.tonnage,
			unit_id: ticket.unit_id,
			driver_id: ticket.driver_id,
			loading_point_id: ticket.loading_point_id,
			dumping_point_id: ticket.dumping_point_id,
			material_id: ticket.material_id,
			shift_id: ticket.shift_id,
			remarks: ticket.remarks || "",
			reason: ""
		});
		setIsCorrectOpen(true);
	};
	const handleCorrectSubmit = (e) => {
		e.preventDefault();
		if (!selectedTicket) return;
		correctForm.post(`/production/tickets/${selectedTicket.id}/correct`, { onSuccess: () => {
			setIsCorrectOpen(false);
			correctForm.reset();
		} });
	};
	const openDetail = (ticket) => {
		setSelectedTicket(ticket);
		setIsDetailOpen(true);
	};
	const getStatusBadge = (status) => {
		switch (status) {
			case "verified": return /* @__PURE__ */ jsx(Badge, {
				variant: "success",
				children: "Verified (Resmi)"
			});
			case "pending_verification":
			case "submitted": return /* @__PURE__ */ jsx(Badge, {
				variant: "warning",
				children: "Pending Verification"
			});
			case "rejected": return /* @__PURE__ */ jsx(Badge, {
				variant: "danger",
				children: "Rejected (Ditolak)"
			});
			case "corrected": return /* @__PURE__ */ jsx(Badge, {
				variant: "primary",
				children: "Corrected (Revisi)"
			});
			case "draft": return /* @__PURE__ */ jsx(Badge, {
				variant: "secondary",
				children: "Draft"
			});
			default: return /* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				children: status
			});
		}
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Manajemen Tiket Dumping — TAP Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-indigo-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(Ticket, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Manajemen Tiket Dumping"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Pencatatan tiket timbangan/checker JSI, alur verifikasi, proteksi duplikasi, dan audit koreksi"
				})] })]
			}) }), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ jsxs(Button, {
					variant: "secondary",
					onClick: () => router.get("/production/import"),
					children: [/* @__PURE__ */ jsx(Download, { className: "w-4 h-4 mr-2" }), "Bulk Import Excel"]
				}), /* @__PURE__ */ jsxs(Button, {
					onClick: () => setIsCreateOpen(true),
					children: [/* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-2" }), "Input Tiket Baru"]
				})]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					onClick: () => {
						setFilterStatus("");
						router.get("/production/tickets");
					},
					className: `p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === "" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-slate-500 uppercase",
						children: "Semua Tiket"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-slate-900 dark:text-white mt-1",
						children: counts.total || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					onClick: () => {
						setFilterStatus("verified");
						router.get("/production/tickets", { status: "verified" });
					},
					className: `p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === "verified" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-emerald-700 dark:text-emerald-300 uppercase",
						children: "Verified (Produksi)"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1",
						children: counts.verified || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					onClick: () => {
						setFilterStatus("pending_verification");
						router.get("/production/tickets", { status: "pending_verification" });
					},
					className: `p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === "pending_verification" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40" : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-amber-700 dark:text-amber-300 uppercase",
						children: "Pending Verifikasi"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-amber-600 dark:text-amber-400 mt-1",
						children: counts.pending || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					onClick: () => {
						setFilterStatus("rejected");
						router.get("/production/tickets", { status: "rejected" });
					},
					className: `p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === "rejected" ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40" : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-rose-700 dark:text-rose-300 uppercase",
						children: "Ditolak (Rejected)"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-rose-600 dark:text-rose-400 mt-1",
						children: counts.rejected || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					onClick: () => {
						setFilterStatus("corrected");
						router.get("/production/tickets", { status: "corrected" });
					},
					className: `p-3 rounded-lg border cursor-pointer transition-all ${filterStatus === "corrected" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40" : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-blue-700 dark:text-blue-300 uppercase",
						children: "Corrected (Revisi)"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xl font-black text-blue-600 dark:text-blue-400 mt-1",
						children: counts.corrected || 0
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-medium text-purple-700 dark:text-purple-300 uppercase",
						children: "Total Tonase Resmi"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-xl font-black text-purple-600 dark:text-purple-400 mt-1",
						children: [Number(counts.total_production_ton || 0).toFixed(1), " T"]
					})]
				})
			]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "lg:col-span-2",
						children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
							children: "Cari Tiket / Unit / Checker"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Search, { className: "w-4 h-4 absolute left-3 top-2.5 text-slate-400" }), /* @__PURE__ */ jsx(Input, {
								value: search,
								onChange: (e) => setSearch(e.target.value),
								placeholder: "No Tiket, DT-101, Nama Checker...",
								className: "pl-9"
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Status"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterStatus,
						onChange: (e) => setFilterStatus(e.target.value),
						options: [
							{
								value: "",
								label: "Semua Status"
							},
							{
								value: "verified",
								label: "Verified (Resmi)"
							},
							{
								value: "pending_verification",
								label: "Pending Verifikasi"
							},
							{
								value: "submitted",
								label: "Submitted"
							},
							{
								value: "rejected",
								label: "Rejected"
							},
							{
								value: "corrected",
								label: "Corrected"
							}
						]
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Dari Tanggal"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: dateFrom,
						onChange: (e) => setDateFrom(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Sampai Tanggal"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: dateTo,
						onChange: (e) => setDateTo(e.target.value)
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Filter"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ jsx("thead", {
						className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "No. Tiket"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Tanggal & Jam"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Unit & Driver"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Loading - Dumping"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Material"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Tonase"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4",
								children: "Checker JSI"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-center",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "py-3 px-4 text-right",
								children: "Aksi"
							})
						] })
					}), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100 dark:divide-slate-800",
						children: tickets.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: "9",
							className: "py-8 text-center text-slate-400",
							children: "Tidak ada tiket dumping yang sesuai dengan kriteria pencarian."
						}) }) : tickets.data.map((t) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
							children: [
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400",
									children: t.ticket_number
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-slate-600 dark:text-slate-400",
									children: [/* @__PURE__ */ jsx("div", { children: t.ticket_date }), /* @__PURE__ */ jsxs("div", {
										className: "text-[11px] text-slate-400",
										children: [
											t.dumping_time ? new Date(t.dumping_time).toLocaleTimeString("id-ID", {
												hour: "2-digit",
												minute: "2-digit"
											}) : "-",
											" • ",
											t.shift?.name
										]
									})]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
										children: [/* @__PURE__ */ jsx(Truck, { className: "w-3.5 h-3.5 text-slate-400" }), t.unit?.unit_code]
									}), /* @__PURE__ */ jsx("div", {
										className: "text-[11px] text-slate-500",
										children: t.driver?.employee?.name
									})]
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-slate-700 dark:text-slate-300",
									children: [/* @__PURE__ */ jsx("div", { children: t.loading_point?.name }), /* @__PURE__ */ jsxs("div", {
										className: "text-[11px] text-slate-400",
										children: ["ke ", t.dumping_point?.name]
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4",
									children: /* @__PURE__ */ jsx(Badge, {
										variant: "outline",
										children: t.material?.name
									})
								}),
								/* @__PURE__ */ jsxs("td", {
									className: "py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm",
									children: [Number(t.tonnage).toFixed(2), " T"]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-slate-600 dark:text-slate-300",
									children: t.checker_name
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-center",
									children: getStatusBadge(t.status)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "py-3 px-4 text-right",
									children: /* @__PURE__ */ jsxs("div", {
										className: "inline-flex gap-1",
										children: [
											/* @__PURE__ */ jsx("button", {
												onClick: () => openDetail(t),
												title: "Lihat Detail & Audit",
												className: "p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300",
												children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
											}),
											t.status !== "verified" && /* @__PURE__ */ jsx("button", {
												onClick: () => handleVerify(t),
												title: "Verifikasi Tiket",
												className: "p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
												children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4" })
											}),
											t.status !== "rejected" && /* @__PURE__ */ jsx("button", {
												onClick: () => openReject(t),
												title: "Tolak Tiket",
												className: "p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400",
												children: /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" })
											}),
											/* @__PURE__ */ jsx("button", {
												onClick: () => openCorrect(t),
												title: "Koreksi Khusus (Audit Trail)",
												className: "p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400",
												children: /* @__PURE__ */ jsx(Edit3, { className: "w-4 h-4" })
											})
										]
									})
								})
							]
						}, t.id))
					})]
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "p-4 border-t border-slate-100 dark:border-slate-800",
				children: /* @__PURE__ */ jsx(Pagination, { links: tickets.links })
			})]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCreateOpen,
			onClose: () => setIsCreateOpen(false),
			title: "Input Tiket Dumping (Data Sumber JSI)",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCreateSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Nomor Tiket (Unik)"
							}),
							/* @__PURE__ */ jsx(Input, {
								value: createForm.data.ticket_number,
								onChange: (e) => createForm.setData("ticket_number", e.target.value),
								placeholder: "TKT-YYYYMMDD-XXX",
								required: true
							}),
							createForm.errors.ticket_number && /* @__PURE__ */ jsx("p", {
								className: "text-rose-600 text-[11px] mt-1",
								children: createForm.errors.ticket_number
							})
						] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Nama Checker JSI"
						}), /* @__PURE__ */ jsx(Input, {
							value: createForm.data.checker_name,
							onChange: (e) => createForm.setData("checker_name", e.target.value),
							placeholder: "Nama checker timbangan...",
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Tanggal Tiket"
						}), /* @__PURE__ */ jsx(Input, {
							type: "date",
							value: createForm.data.ticket_date,
							onChange: (e) => createForm.setData("ticket_date", e.target.value),
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Jam Dumping"
						}), /* @__PURE__ */ jsx(Input, {
							type: "time",
							value: createForm.data.dumping_time,
							onChange: (e) => createForm.setData("dumping_time", e.target.value),
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Unit Armada DT"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.unit_id,
							onChange: (e) => createForm.setData("unit_id", e.target.value),
							options: master.units?.map((u) => ({
								value: u.id,
								label: `${u.unit_code} (${u.capacity_ton}T)`
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Driver"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.driver_id,
							onChange: (e) => createForm.setData("driver_id", e.target.value),
							options: master.drivers?.map((d) => ({
								value: d.id,
								label: `${d.employee?.name} (${d.driver_code})`
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Loading Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.loading_point_id,
							onChange: (e) => createForm.setData("loading_point_id", e.target.value),
							options: master.loading_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Dumping Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: createForm.data.dumping_point_id,
							onChange: (e) => createForm.setData("dumping_point_id", e.target.value),
							options: master.dumping_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Material"
							}), /* @__PURE__ */ jsx(Select, {
								value: createForm.data.material_id,
								onChange: (e) => createForm.setData("material_id", e.target.value),
								options: master.materials?.map((m) => ({
									value: m.id,
									label: m.name
								})) || [],
								required: true
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Shift"
							}), /* @__PURE__ */ jsx(Select, {
								value: createForm.data.shift_id,
								onChange: (e) => createForm.setData("shift_id", e.target.value),
								options: master.shifts?.map((s) => ({
									value: s.id,
									label: s.name
								})) || [],
								required: true
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
								children: "Netto Tonase (Ton)"
							}), /* @__PURE__ */ jsx(Input, {
								type: "number",
								step: "0.01",
								min: "0.01",
								value: createForm.data.tonnage,
								onChange: (e) => createForm.setData("tonnage", e.target.value),
								placeholder: "31.50",
								required: true
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Keterangan / Remarks"
					}), /* @__PURE__ */ jsx(Input, {
						value: createForm.data.remarks,
						onChange: (e) => createForm.setData("remarks", e.target.value),
						placeholder: "Catatan tambahan muatan..."
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCreateOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: createForm.processing,
							children: "Simpan Tiket"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isDetailOpen,
			onClose: () => setIsDetailOpen(false),
			title: `Detail Tiket ${selectedTicket?.ticket_number}`,
			children: selectedTicket && /* @__PURE__ */ jsxs("div", {
				className: "space-y-4 text-xs",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex justify-between items-center",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "text-slate-500 block",
							children: "Status Produksi"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-1",
							children: getStatusBadge(selectedTicket.status)
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-500 block",
								children: "Total Tonase"
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-lg font-black text-slate-900 dark:text-white",
								children: [Number(selectedTicket.tonnage).toFixed(2), " Ton"]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-lg",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Nomor Tiket:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono font-bold text-slate-800 dark:text-slate-200",
								children: selectedTicket.ticket_number
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Tanggal & Jam:"
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-slate-800 dark:text-slate-200",
								children: [
									selectedTicket.ticket_date,
									" ",
									selectedTicket.dumping_time
								]
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Armada Unit:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-slate-800 dark:text-slate-200",
								children: selectedTicket.unit?.unit_code
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Driver:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-slate-800 dark:text-slate-200",
								children: selectedTicket.driver?.employee?.name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Rute Loading:"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-slate-800 dark:text-slate-200",
								children: selectedTicket.loading_point?.name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Rute Dumping:"
							}), /* @__PURE__ */ jsx("span", {
								className: "text-slate-800 dark:text-slate-200",
								children: selectedTicket.dumping_point?.name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "External Checker:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-semibold text-slate-800 dark:text-slate-200",
								children: selectedTicket.checker_name
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
								className: "text-slate-400 block text-[11px]",
								children: "Sumber Data:"
							}), /* @__PURE__ */ jsx("span", {
								className: "font-mono uppercase text-slate-800 dark:text-slate-200",
								children: selectedTicket.source
							})] })
						]
					}),
					selectedTicket.status === "rejected" && /* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-bold block",
								children: "Alasan Penolakan:"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1",
								children: selectedTicket.rejection_reason
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[10px] text-rose-500 block mt-1",
								children: ["Ditolak pada: ", selectedTicket.rejected_at]
							})
						]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "font-bold text-slate-800 dark:text-slate-200 mb-2",
						children: "Riwayat Koreksi Tiket"
					}), selectedTicket.corrections?.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-slate-400",
						children: "Tidak ada riwayat koreksi pada tiket ini."
					}) : /* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: selectedTicket.corrections.map((c) => /* @__PURE__ */ jsxs("div", {
							className: "p-2.5 rounded border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex justify-between text-[11px]",
									children: [/* @__PURE__ */ jsx("span", {
										className: "font-semibold text-blue-700 dark:text-blue-300",
										children: "Koreksi Diajukan"
									}), /* @__PURE__ */ jsx("span", {
										className: "text-slate-400",
										children: c.created_at
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-slate-700 dark:text-slate-300 font-medium",
									children: ["Alasan: ", c.reason]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-1 text-[11px] text-slate-500",
									children: [
										"Tonase lama: ",
										/* @__PURE__ */ jsxs("strong", { children: [c.old_data?.tonnage, " T"] }),
										" → Tonase baru: ",
										/* @__PURE__ */ jsxs("strong", { children: [c.new_data?.tonnage, " T"] })
									]
								})
							]
						}, c.id))
					})] }),
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-end pt-2",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "secondary",
							onClick: () => setIsDetailOpen(false),
							children: "Tutup"
						})
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isRejectOpen,
			onClose: () => setIsRejectOpen(false),
			title: `Tolak Tiket ${selectedTicket?.ticket_number}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleRejectSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2",
						children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-rose-600 shrink-0 mt-0.5" }), /* @__PURE__ */ jsxs("span", { children: [
							"Tiket yang ditolak ",
							/* @__PURE__ */ jsx("strong", { children: "TIDAK AKAN DIHITUNG" }),
							" dalam rekapitulasi produksi resmi TAP."
						] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Alasan Penolakan (Wajib Diisi)"
					}), /* @__PURE__ */ jsx("textarea", {
						value: rejectForm.data.rejection_reason,
						onChange: (e) => rejectForm.setData("rejection_reason", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5",
						rows: 3,
						placeholder: "Tuliskan alasan penolakan secara spesifik (misal: Unit tidak sesuai dispatch, selisih timbangan di luar toleransi)...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsRejectOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "danger",
							disabled: rejectForm.processing,
							children: "Konfirmasi Penolakan"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isCorrectOpen,
			onClose: () => setIsCorrectOpen(false),
			title: `Koreksi Khusus: ${selectedTicket?.ticket_number}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleCorrectSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-xs text-blue-800 dark:text-blue-200",
						children: "Tiket yang sudah verified tidak dapat diedit langsung. Perubahan nilai tonase atau armada harus disertai alasan resmi dan dicatat di audit trail."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Tonase Baru (Ton)"
						}), /* @__PURE__ */ jsx(Input, {
							type: "number",
							step: "0.01",
							value: correctForm.data.tonnage,
							onChange: (e) => correctForm.setData("tonnage", e.target.value),
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Ganti Unit Armada"
						}), /* @__PURE__ */ jsx(Select, {
							value: correctForm.data.unit_id,
							onChange: (e) => correctForm.setData("unit_id", e.target.value),
							options: master.units?.map((u) => ({
								value: u.id,
								label: u.unit_code
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Loading Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: correctForm.data.loading_point_id,
							onChange: (e) => correctForm.setData("loading_point_id", e.target.value),
							options: master.loading_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
							children: "Dumping Point"
						}), /* @__PURE__ */ jsx(Select, {
							value: correctForm.data.dumping_point_id,
							onChange: (e) => correctForm.setData("dumping_point_id", e.target.value),
							options: master.dumping_points?.map((l) => ({
								value: l.id,
								label: l.name
							})) || [],
							required: true
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Alasan Koreksi (Audit Trail Wajib)"
					}), /* @__PURE__ */ jsx("textarea", {
						value: correctForm.data.reason,
						onChange: (e) => correctForm.setData("reason", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5",
						rows: 3,
						placeholder: "Alasan perubahan angka tonase atau data tiket (misal: printout timbangan JSI keliru ketik tare weight)...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsCorrectOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							disabled: correctForm.processing,
							children: "Simpan Koreksi"
						})]
					})
				]
			})
		})
	] });
}
// resources/js/Pages/Production/Tickets/Verification.jsx
var Verification_exports = /* @__PURE__ */ __exportAll({ default: () => TicketVerification });
function TicketVerification({ pendingTickets = { data: [] }, filters = {}, shifts = [] }) {
	const [selectedIds, setSelectedIds] = useState([]);
	const [filterDate, setFilterDate] = useState(filters.date || "");
	const [filterShift, setFilterShift] = useState(filters.shift_id || "");
	const [isRejectOpen, setIsRejectOpen] = useState(false);
	const [targetTicket, setTargetTicket] = useState(null);
	const rejectForm = useForm({ rejection_reason: "" });
	const handleFilter = (e) => {
		e.preventDefault();
		router.get("/production/tickets/verification-queue", {
			date: filterDate,
			shift_id: filterShift
		}, { preserveState: true });
	};
	const handleSingleVerify = (ticket) => {
		if (confirm(`Verifikasi tiket ${ticket.ticket_number} (${ticket.tonnage} Ton)?`)) router.post(`/production/tickets/${ticket.id}/verify`, {}, { preserveScroll: true });
	};
	const handleBatchVerify = () => {
		if (selectedIds.length === 0) return;
		if (confirm(`Verifikasi sekaligus ${selectedIds.length} tiket terpilih sebagai data produksi resmi?`)) router.post("/production/tickets/batch-verify", { ticket_ids: selectedIds }, {
			preserveScroll: true,
			onSuccess: () => setSelectedIds([])
		});
	};
	const openReject = (ticket) => {
		setTargetTicket(ticket);
		rejectForm.setData({ rejection_reason: "" });
		setIsRejectOpen(true);
	};
	const handleRejectSubmit = (e) => {
		e.preventDefault();
		if (!targetTicket) return;
		rejectForm.post(`/production/tickets/${targetTicket.id}/reject`, { onSuccess: () => {
			setIsRejectOpen(false);
			rejectForm.reset();
		} });
	};
	const toggleSelectAll = () => {
		if (selectedIds.length === pendingTickets.data.length) setSelectedIds([]);
		else setSelectedIds(pendingTickets.data.map((t) => t.id));
	};
	const toggleSelectOne = (id) => {
		if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
		else setSelectedIds([...selectedIds, id]);
	};
	return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Verifikasi Tiket Dumping — TAP Coal Hauling" }),
		/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "p-2 rounded-lg bg-amber-600 text-white shadow-sm",
					children: /* @__PURE__ */ jsx(ShieldCheck, { className: "w-5 h-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight text-slate-900 dark:text-white",
					children: "Antrean Verifikasi Tiket Dumping"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-slate-500 dark:text-slate-400",
					children: "Workflow persetujuan produksi resmi oleh Supervisor / Foreman Hauling"
				})] })]
			}) }), /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-3",
				children: selectedIds.length > 0 && /* @__PURE__ */ jsxs(Button, {
					onClick: handleBatchVerify,
					className: "bg-emerald-600 hover:bg-emerald-700",
					children: [
						/* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }),
						"Verifikasi Terpilih (",
						selectedIds.length,
						")"
					]
				})
			})]
		}),
		/* @__PURE__ */ jsx(Card, {
			className: "p-4 mb-6",
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleFilter,
				className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Tanggal Operasional"
					}), /* @__PURE__ */ jsx(Input, {
						type: "date",
						value: filterDate,
						onChange: (e) => setFilterDate(e.target.value)
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1",
						children: "Shift Kerja"
					}), /* @__PURE__ */ jsx(Select, {
						value: filterShift,
						onChange: (e) => setFilterShift(e.target.value),
						options: [{
							value: "",
							label: "Semua Shift"
						}, ...shifts.map((s) => ({
							value: s.id,
							label: s.name
						})) || []]
					})] }),
					/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						children: [/* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 mr-1" }), "Terapkan Filter"]
					}) })
				]
			})
		}),
		/* @__PURE__ */ jsxs(Card, {
			className: "overflow-hidden",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "p-3 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx(AlertTriangle, { className: "w-4 h-4 text-amber-600" }),
							"Hanya tiket berstatus ",
							/* @__PURE__ */ jsx("strong", { children: "Verified" }),
							" yang akan dihitung ke dalam angka produksi tonase resmi."
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "font-bold",
						children: [pendingTickets.total || 0, " Tiket Menunggu Approval"]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "w-full text-left text-xs",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider font-semibold",
							children: /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3 text-center w-10",
									children: /* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: selectedIds.length > 0 && selectedIds.length === pendingTickets.data.length,
										onChange: toggleSelectAll,
										className: "rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
									})
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "No. Tiket"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "Tanggal & Jam"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "Armada & Driver"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "Rute Dumping"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "Material"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3 text-right",
									children: "Tonase Netto"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3",
									children: "Checker JSI"
								}),
								/* @__PURE__ */ jsx("th", {
									className: "py-3 px-3 text-right",
									children: "Aksi Verifikasi"
								})
							] })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100 dark:divide-slate-800",
							children: pendingTickets.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", {
								colSpan: "9",
								className: "py-12 text-center text-slate-400",
								children: [
									/* @__PURE__ */ jsx(CheckCircle2, { className: "w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-60" }),
									/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-sm",
										children: "Semua tiket telah diverifikasi!"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-400 mt-1",
										children: "Tidak ada antrean verifikasi yang tertunda pada filter ini."
									})
								]
							}) }) : pendingTickets.data.map((t) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-3 text-center",
										children: /* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: selectedIds.includes(t.id),
											onChange: () => toggleSelectOne(t.id),
											className: "rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400",
										children: t.ticket_number
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-3 text-slate-600 dark:text-slate-400",
										children: [/* @__PURE__ */ jsx("div", { children: t.ticket_date }), /* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-slate-400",
											children: [
												t.dumping_time ? new Date(t.dumping_time).toLocaleTimeString("id-ID", {
													hour: "2-digit",
													minute: "2-digit"
												}) : "-",
												" • ",
												t.shift?.name
											]
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-3",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "font-bold text-slate-900 dark:text-white flex items-center gap-1.5",
											children: [/* @__PURE__ */ jsx(Truck, { className: "w-3.5 h-3.5 text-slate-400" }), t.unit?.unit_code]
										}), /* @__PURE__ */ jsx("div", {
											className: "text-[11px] text-slate-500",
											children: t.driver?.employee?.name
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-3 text-slate-700 dark:text-slate-300",
										children: [/* @__PURE__ */ jsx("div", { children: t.loading_point?.name }), /* @__PURE__ */ jsxs("div", {
											className: "text-[11px] text-slate-400",
											children: ["ke ", t.dumping_point?.name]
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-3",
										children: /* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											children: t.material?.name
										})
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "py-3 px-3 text-right font-black text-slate-900 dark:text-white text-sm",
										children: [Number(t.tonnage).toFixed(2), " T"]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-3 text-slate-600 dark:text-slate-400",
										children: t.checker_name
									}),
									/* @__PURE__ */ jsx("td", {
										className: "py-3 px-3 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "inline-flex gap-1.5",
											children: [/* @__PURE__ */ jsxs(Button, {
												size: "sm",
												onClick: () => handleSingleVerify(t),
												className: "bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5",
												children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), "Setujui"]
											}), /* @__PURE__ */ jsxs(Button, {
												size: "sm",
												variant: "danger",
												onClick: () => openReject(t),
												className: "py-1 px-2.5",
												children: [/* @__PURE__ */ jsx(XCircle, { className: "w-3.5 h-3.5 mr-1" }), "Tolak"]
											})]
										})
									})
								]
							}, t.id))
						})]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "p-4 border-t border-slate-100 dark:border-slate-800",
					children: /* @__PURE__ */ jsx(Pagination, { links: pendingTickets.links })
				})
			]
		}),
		/* @__PURE__ */ jsx(Modal, {
			isOpen: isRejectOpen,
			onClose: () => setIsRejectOpen(false),
			title: `Tolak Tiket ${targetTicket?.ticket_number}`,
			children: /* @__PURE__ */ jsxs("form", {
				onSubmit: handleRejectSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-xs text-rose-800 dark:text-rose-200",
						children: [
							"Tiket yang ditolak ",
							/* @__PURE__ */ jsx("strong", { children: "TIDAK AKAN DIHITUNG" }),
							" dalam rekapitulasi produksi resmi TAP."
						]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1",
						children: "Alasan Penolakan (Wajib Diisi)"
					}), /* @__PURE__ */ jsx("textarea", {
						value: rejectForm.data.rejection_reason,
						onChange: (e) => rejectForm.setData("rejection_reason", e.target.value),
						className: "w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 p-2.5",
						rows: 3,
						placeholder: "Alasan penolakan (misal: Unit tidak sesuai dengan penugasan dispatch, tonase tidak valid)...",
						required: true
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex justify-end gap-2 pt-2",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setIsRejectOpen(false),
							children: "Batal"
						}), /* @__PURE__ */ jsx(Button, {
							type: "submit",
							variant: "danger",
							disabled: rejectForm.processing,
							children: "Konfirmasi Tolak Tiket"
						})]
					})
				]
			})
		})
	] });
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
			"./Pages/Analytics/Index.jsx": Index_exports$24,
			"./Pages/Customers/Index.jsx": Index_exports$23,
			"./Pages/Dashboard/Index.jsx": Index_exports$22,
			"./Pages/Drivers/Index.jsx": Index_exports$21,
			"./Pages/Employees/Index.jsx": Index_exports$20,
			"./Pages/Fleet/HMKM/Index.jsx": Index_exports$19,
			"./Pages/Fleet/KPI/Index.jsx": Index_exports$18,
			"./Pages/Fleet/P2H/Index.jsx": Index_exports$17,
			"./Pages/Fleet/Registry/Index.jsx": Index_exports$16,
			"./Pages/Fleet/WorkOrders/Index.jsx": Index_exports$15,
			"./Pages/Locations/Index.jsx": Index_exports$14,
			"./Pages/Materials/Index.jsx": Index_exports$13,
			"./Pages/Organization/Index.jsx": Index_exports$12,
			"./Pages/Production/Dashboard.jsx": Dashboard_exports,
			"./Pages/Production/Dispatch/Index.jsx": Index_exports$11,
			"./Pages/Production/Hauling/Index.jsx": Index_exports$10,
			"./Pages/Production/Import/Index.jsx": Index_exports$9,
			"./Pages/Production/Recap/Index.jsx": Index_exports$8,
			"./Pages/Production/Reconciliation/Detail.jsx": Detail_exports,
			"./Pages/Production/Reconciliation/Index.jsx": Index_exports$7,
			"./Pages/Production/Targets/Index.jsx": Index_exports$6,
			"./Pages/Production/Tickets/Index.jsx": Index_exports$5,
			"./Pages/Production/Tickets/Verification.jsx": Verification_exports,
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
