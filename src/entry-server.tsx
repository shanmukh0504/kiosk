import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./pages";
import { Meta } from "./layout/Meta";
import generatePageMetadata from "./utils/metaDataUtils";

interface IRenderProps {
    path: string;
}

export const render = ({ path }: IRenderProps) => {
    const metadata = generatePageMetadata(path);

    return {
        html: ReactDOMServer.renderToString(
            <StaticRouter location={path}>
                <Meta path={path} />
                <App />
            </StaticRouter>
        ),
        metadata
    };
};