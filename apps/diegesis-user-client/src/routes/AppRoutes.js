import React from 'react';
import { BrowserRouter, Route, Routes, useRouteError } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import MarkdownPage from "../pages/MarkdownPage";
import ListPage from "../pages/ListPage";
import EntryDetailPage from "../pages/EntryDetailsPage";
import EntryBrowsePage from "../pages/EntryBrowsePage";
import EntrySearchPage from "../pages/EntrySearchPage";
import EntryDownloadPage from "../pages/EntryDownloadPage";
import UIConfigPage from "../pages/UIConfigPage";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import { useMemo } from "react";



function ErrorBoundary() {
    let error = useRouteError();
    console.error('useRouteError', error);
    return (
        <div>
            An unexpected error has occurred: <i>{error.message}</i>
        </div>
    );
}

export default function AppRoutes() {
    const { clientStructure } = useAppContext();

    const routeList = useMemo(() => {
        const routeList = []
        if (Array.isArray(clientStructure.urls) && clientStructure.urls.length > 0) {
            const markdownPageRoutes = (structure) => {
                let ret = [];
                if (structure.urls) {
                    for (const url of structure.urls) {
                        if (url === 'list') {
                            continue;
                        }
                        ret.push(
                            {
                                path: (url === 'home' ? '/' : `/${url}`),
                                element: <MarkdownPage url={url} />,
                                errorElement: <ErrorBoundary />
                            }
                        );
                    }
                }
                return ret;
            }
            routeList.push(...markdownPageRoutes(clientStructure))
        }
        routeList.push(...[
            {
                path: '/',
                element: <MarkdownPage url={'home'} />,
            }, // added default route because GraphQL response can be delay.
            {
                path: "/list",
                element: <ListPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/entry/details/:source/:entryId/:revision",
                element: <EntryDetailPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/entry/browse/:source/:entryId/:revision",
                element: <EntryBrowsePage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/entry/search/:source/:entryId/:revision",
                element: <EntrySearchPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/entry/download/:source/:entryId/:revision",
                element: <EntryDownloadPage />,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/ui-config",
                element: <ProtectedRoute roles={['admin']}>
                    <UIConfigPage />
                </ProtectedRoute>,
                errorElement: <ErrorBoundary />
            },
            {
                path: "/login",
                element: <LoginPage />,
                errorElement: <ErrorBoundary />
            }
        ])
        return routeList
    }, [clientStructure]);

    return (
        <BrowserRouter>
            <Routes>
                {routeList.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} errorElement={route.errorElement} />
                ))}
            </Routes>
        </BrowserRouter>
    );
};