<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Laravel Dashboard') }}</title>

    <!-- Prevent FOUC for Dark Mode -->
    <script>
        (function() {
            try {
                const storedTheme = localStorage.getItem('theme-storage');
                if (storedTheme) {
                    const parsed = JSON.parse(storedTheme);
                    if (parsed.state && parsed.state.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else if (parsed.state && parsed.state.theme === 'light') {
                        document.documentElement.classList.remove('dark');
                    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                    }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
            } catch (e) {}
        })();
    </script>

    <!-- Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
    @inertia
</body>
</html>
