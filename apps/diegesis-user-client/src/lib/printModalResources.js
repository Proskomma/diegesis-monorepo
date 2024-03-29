import {SofriaRenderFromProskomma} from 'proskomma-json-tools';
import sofria2WebActions from "../renderer/sofria2web";
import {renderers} from "../renderer/render2html";

const printModalResources = ({
    pageCssTemplate: `
        @page {
            size: %pageWidth% %pageHeight%;
            margin-top: 20mm;
            margin-left: 20mm;
            margin-bottom: 30mm;

            @footnote {
                float:bottom;
                border-top: black 1px solid;
                padding-top: 2mm;
                font-size: 8pt;
            }

            @bottom-center {
                content: counter(page);
            }

            @top-center {
                content: element(heading);
            }

            @top-right {
                content: none;
            }
        }

        @page :blank {
            @bottom-center {
                content: none;
            }

            @top-center {
                content: none;
            }

            @top-right {
                content: none;
            }

        }

        @page :right {
            margin-left: 30mm;
            margin-right: 20mm;
        }

        @page :left {
            margin-right: 30mm;
            margin-left: 20mm;
        }
        
        #paras {
            columns: %nColumns%
        }
        h1, h2, h3, h4, h5 {
            columns: 1
        }
        `,
    pageSizes: {
        A4P: {
            label: "A4 Portrait",
            orientation: "portrait",
            width: "210mm",
            height: "297mm"
        },
        A4L: {
            label: "A4 Landscape",
            orientation: "landscape",
            width: "297mm",
            height: "210mm"
        },
        A5P: {
            label: "A5 Portrait",
            orientation: "portrait",
            width: "148.5mm",
            height: "210mm"
        },
        USLP: {
            label: "US Letter Portrait",
            orientation: "portrait",
            width: "8.5in",
            height: "11in"
        },
        USLL: {
            label: "US Letter Landscape",
            orientation: "landscape",
            width: "11in",
            height: "8.5in"
        },
        TRP: {
            label: "Trade Portrait",
            orientation: "portrait",
            width: "6in",
            height: "9in"
        },
        CQP: {
            label: "Crown Quarto Portrait",
            orientation: "portrait",
            width: "189mm",
            height: "246mm"
        }
    },
    doRender: function ({pk, scriptureData, docId}) {
        if (!docId) {
            return;
        }
        const renderer = new SofriaRenderFromProskomma({
            proskomma: pk,
            actions: sofria2WebActions,
        });

        const config = {renderers};
        for (const sdKey of Object.keys(scriptureData)) {
            config[sdKey] = scriptureData[sdKey];
        }
        const output = {};
        try {
            renderer.renderDocument({
                docId,
                config,
                output,
            });
        } catch (err) {
            console.log("Renderer", err);
            throw err;
        }
        return output.paras;
    }
});

export default printModalResources;
