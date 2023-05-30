import { RouterProvider, createBrowserRouter, useRouteError } from "react-router-dom";
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
import EntriesSyncPage from "../pages/EntriesSyncPage";

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
    
    const markdownPageRoutes = (structure) => {
        let ret = [];
        if (structure.urls) {
            for (const url of structure.urls) {
                if (url === 'list') {
                    continue;
                }
                ret.push(
                    {
                        path: (url === 'home' ? '/' : `${url}`),
                        element: <MarkdownPage url={url} />,
                        errorElement: <ErrorBoundary />
                    }
                );
            }
        }
        return ret;
    }

    const router = createBrowserRouter([
        {
            path: '/',
            element: <MarkdownPage url={'home'} />,
        }, // added default route because GraphQL response can be delay.
        ...markdownPageRoutes(clientStructure),
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
            path: "/login",
            element: <LoginPage />,
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
            path: "/entries-sync",
            element: <ProtectedRoute roles={['admin']}>
                <EntriesSyncPage />
            </ProtectedRoute>,
            errorElement: <ErrorBoundary />
        },
    ]);

    return (<RouterProvider router={router} />)
}