import { useEffect } from "react";
import { useAuth } from "~/lib/authContext";
import { useSearchParams } from "react-router";

export default function SignIn() {
    const { refreshSession } = useAuth();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("return_to");

    useEffect(() => {
        // Refresh session when landing on signin page (in case user just logged in via redirect)
        refreshSession();
    }, [refreshSession]);

    const loginUri = `https://project.frankhagan.online/auth/login.php?hd=wit.edu${
        returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ""
    }`;

    return (
        <main className="pt-16 p-4 container mx-auto max-w-1/2">
            <h1 className="text-4xl font-bold mb-4">Sign In to Lost and Found</h1>
            <p>
                You must sign in using your <i>@wit.edu</i> credentials.
            </p>
            <p>
                Try to use the automatic login that appears in the top-right portion of your screen or click below to
                sign in with Google.
            </p>
            <br />
            <div
                id="g_id_onload"
                data-client_id="637137446671-qs5t8u2jegvm8bactoe5qf57tacp4r67.apps.googleusercontent.com"
                data-context="signin"
                data-ux_mode="redirect"
                data-login_uri={loginUri}
                data-hd="wit.edu"
                data-auto_select="true"
                data-itp_support="true"
            ></div>

            <div
                className="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="outline"
                data-text="signin_with"
                data-hd="wit.edu"
                data-size="large"
                data-logo_alignment="left"
            ></div>
            <script src="https://accounts.google.com/gsi/client" async></script>
        </main>
    );
}
