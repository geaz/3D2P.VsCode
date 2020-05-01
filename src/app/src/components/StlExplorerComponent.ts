import { h, Component } from 'preact';
import { css } from 'emotion'
import htm from 'htm';

import { SplittedPaneComponent } from './SplittedPaneComponent';
import { IProjectFile } from '../model/IProjectFile';
import { StlViewerContext } from '../stlViewer/threejs/StlViewerContext';
import { IStlInfo } from '../model/IStlInfo';
import { IFileInfo } from '../model/IFileInfo';
import { StlViewerComponent } from '../stlViewer/StlViewerComponent';
import { IConfigDescription, ConfigType, ConfigComponent } from './ConfigComponent';
import { AnnotationsComponent } from '../stlViewer/AnnotationsComponent';
import { FileListComponent } from './FileListComponent';

const html = htm.bind(h);

interface StlExplorerComponentProps {
    projectFile: IProjectFile,
    projectFolderUrl: string
}

interface StlExplorerComponentState {
    showAnnotations: boolean;
    stlViewerContext: StlViewerContext;
    selectedStl: IStlInfo;
}

export class StlExplorerComponent extends Component<StlExplorerComponentProps, StlExplorerComponentState> {
    private _config: any;
    private _configDescription = new Array<IConfigDescription>();
    private _fileList = new Array<IFileInfo>();
    private _stlViewerComponent?: StlViewerComponent;
    
    componentWillMount() {
        this.setFileList();
        this.setState({ 
            showAnnotations: true,
            selectedStl: this.props.projectFile.stlInfoList[0]
        });
        
        this._config = { 
            showAnnotations: true,
            resetCamera: () => {
                this._stlViewerComponent!.resetCamera();
            }
        };
        this._configDescription.push(<IConfigDescription>{ property: 'showAnnotations', type: ConfigType.CheckBox });
        this._configDescription.push(<IConfigDescription>{ property: 'resetCamera', type: ConfigType.Button });
    }

    public render() {
        let annotationsComponent = undefined;
        if(this.state.stlViewerContext !== undefined && this.state.selectedStl.annotationList !== undefined) {
            annotationsComponent = html
                `<${AnnotationsComponent}
                    isEditable=${false}
                    showAnnotations=${this.state.showAnnotations}
                    annotationList=${this.state.selectedStl.annotationList}
                    stlViewerContext=${this.state.stlViewerContext}/>`;
        }

        return html
            `<div className="${this.css()}">
                <${SplittedPaneComponent}                
                    leftPaneComponent=${html`
                        <${FileListComponent}
                            selectedFile=${this.state.selectedStl.name}
                            fileList=${this._fileList}
                            onFileSelected=${(name: string) => this.onFileSelected(name)}/>`}                
                    rightPaneComponent=${html`
                        <div class="stl-wrapper">
                            ${annotationsComponent}
                            <${ConfigComponent} 
                                config=${this._config}
                                containerId="stl-config-component"
                                configDescription=${this._configDescription}
                                onChange=${this.onConfigChanged.bind(this)} />
                            <div id="stl-config-component"></div>
                            <${StlViewerComponent}
                                ref=${(sc: StlViewerComponent) => this._stlViewerComponent = sc}
                                color=${this.state.selectedStl.color} 
                                stlFileUrl="${this.props.projectFolderUrl}/${this.state.selectedStl.name}"
                                onViewerInitiated=${this.onViewerInitiated.bind(this)} />
                        </div>`}
                />
            </div>`;
    }

    private setFileList(): void {
        this._fileList = this.props.projectFile.stlInfoList.map((s: IStlInfo) => { 
            let fileInfo = <IFileInfo>{};
            fileInfo.name = s.name;

            if(s.annotationList !== undefined && s.annotationList.length > 0) {
                if(s.annotationList.length > 1) {                    
                    fileInfo.description = `${s.annotationList.length} Annotations`;
                }
                else {
                    fileInfo.description = `${s.annotationList.length} Annotation`;
                }
            }
            return fileInfo;
        });
    }

    private onFileSelected(name: string): void {
        this.setState({
            selectedStl: this.props.projectFile.stlInfoList.filter((s: any) => s.name === name)[0]
        });
    }    

    private onConfigChanged(property: string, value: any): void {
        if(property === 'showAnnotations') {
            this.setState({ showAnnotations: value });
        }
    }

    private onViewerInitiated(stlViewerContext: StlViewerContext): void {
        this.setState({ stlViewerContext: stlViewerContext });
    }

    private css(): string {
        return css`
            height: 400px;

            .stl-wrapper {
                height: 100%;
                position: relative;
            }
            
            #stl-config-component {
                position: absolute;
                right: 15px;
            }`;
    }
}