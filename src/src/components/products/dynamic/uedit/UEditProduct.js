import React, { useEffect } from 'react'

const UEditProduct = (props) => {
  useEffect(() => {

    window.loaduEdit();
    // window.setupContorls();
    window.loadDocument(window.uStoreConfig.assetPrefix+'/static-internal/uedit/xlimDocument/NewPoster.xlim');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <div className="container uedit-application">
      {/*<div id="mnuColorPicker" className="modal fade" tabIndex="-1" role="dialog">*/}
      {/*  <div className="modal-dialog">*/}
      {/*    <div className="modal-content">*/}
      {/*      <div className="modal-header">*/}
      {/*        <button type="button" className="close" data-dismiss="modal"><i*/}
      {/*          className="icon-remove glyphicon glyphicon-remove"></i></button>*/}
      {/*        <h3 id="lblColorPickerTitle">Pick a Color Value</h3>*/}
      {/*      </div>*/}
      {/*      <div className="modal-body">*/}
      {/*        <div className="rgb-color-titles">*/}
      {/*          <ul>*/}
      {/*            <li id="lblPickRed">Red (0-255)</li>*/}
      {/*            <li id="lblPickGreen">Green (0-255)</li>*/}
      {/*            <li id="lblPickBlue">Blue (0-255)</li>*/}
      {/*          </ul>*/}
      {/*        </div>*/}
      {/*        <div className="rgb-color-values">*/}
      {/*          <ul>*/}
      {/*            <li className="rgb-color-component">*/}
      {/*              <input type="text" maxLength="3" value="0"/></li>*/}
      {/*            <li className="rgb-color-component">*/}
      {/*              <input type="text" maxLength="3" value="0"/></li>*/}
      {/*            <li className="rgb-color-component">*/}
      {/*              <input type="text" maxLength="3" value="0"/></li>*/}
      {/*          </ul>*/}
      {/*        </div>*/}
      {/*        <div className="rgb-color-sample">*/}
      {/*          <div></div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*      <div className="modal-footer">*/}
      {/*        <button type="button" id="btnColorPickerOK" className="btn btn-primary">OK</button>*/}
      {/*        <button type="button" id="btnColorPickerCancel" className="btn btn-default" data-dismiss="modal">Cancel*/}
      {/*        </button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div id="mnuLockOptions" className="modal fade" tabIndex="-1" role="dialog">*/}
      {/*  <div className="modal-dialog">*/}
      {/*    <div className="modal-content">*/}
      {/*      <div className="modal-header">*/}
      {/*        <button type="button" className="close" data-dismiss="modal"><i*/}
      {/*          className="icon-remove glyphicon glyphicon-remove"></i></button>*/}
      {/*        <h3 id="lblLockDocumentTitle" className="noText noGraphic noLine">Document Lock Options</h3>*/}
      {/*        <h3 id="lblLockLineTitle" className="noSpread noGraphic noText">Line Lock Options</h3>*/}
      {/*        <h3 id="lblLockGraphicTitle" className="noLine noSpread noText">Graphic Box Lock Options</h3>*/}
      {/*        <h3 id="lblLockTextTitle" className="noLine noSpread noGraphic">Text Box Lock Options</h3>*/}
      {/*      </div>*/}
      {/*      <div className="modal-body">*/}
      {/*        <div className="lockSection">*/}
      {/*          <div className="lockSectionHeader">*/}
      {/*            <h4 id="lblLockObjectLayout">Object Layout</h4>*/}
      {/*          </div>*/}
      {/*          <div className="lockSectionBody">*/}
      {/*            <ul>*/}
      {/*              <li>*/}
      {/*                <input id="chkLocation" type="checkbox"/><label htmlFor="chkLocation"*/}
      {/*                                                                id="lblLocation">Location</label>*/}
      {/*              </li>*/}
      {/*              <li>*/}
      {/*                <input id="chkDimension" type="checkbox"/><label htmlFor="chkDimension"*/}
      {/*                                                                 id="lblDimension">Dimension</label></li>*/}
      {/*              <li>*/}
      {/*                <input id="chkRotation" type="checkbox"/><label htmlFor="chkRotation"*/}
      {/*                                                                id="lblRotation">Rotation</label>*/}
      {/*              </li>*/}
      {/*              <li className="noGraphic noLine noText">*/}
      {/*                <input id="chkCreateDeleteItems" type="checkbox"/><label htmlFor="chkCreateDeleteItems"*/}
      {/*                                                                         id="lblCreateDeleteItems">Create/Delete*/}
      {/*                Items</label></li>*/}
      {/*              <li className="noSpread">*/}
      {/*                <input id="chkDeleteItem" type="checkbox"/><label htmlFor="chkDeleteItem" id="lblDeleteItem">Delete*/}
      {/*                (item)</label></li>*/}
      {/*              <li className="noGraphic noLine noText">*/}
      {/*                <input id="chkLayerChanges" type="checkbox"/><label htmlFor="chkLayerChanges" id="lblLayerChanges">Layer*/}
      {/*                Changes</label></li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*        <div className="lockSection">*/}
      {/*          <div className="lockSectionHeader">*/}
      {/*            <h4 id="lblLockAppearance">Appearance</h4>*/}
      {/*          </div>*/}
      {/*          <div className="lockSectionBody">*/}
      {/*            <ul>*/}
      {/*              <li>*/}
      {/*                <input id="chkStrokeWeight" type="checkbox"/><label htmlFor="chkStrokeWeight" id="lblStrokeWeight">Stroke*/}
      {/*                Weight</label></li>*/}
      {/*              <li>*/}
      {/*                <input id="chkStrokeColor" type="checkbox"/><label htmlFor="chkStrokeColor" id="lblStrokeColor">Stroke*/}
      {/*                Color</label></li>*/}
      {/*              <li>*/}
      {/*                <input id="chkBackgroundColor" type="checkbox"/><label htmlFor="chkBackgroundColor"*/}
      {/*                                                                       id="lblBackgroundColor">Background*/}
      {/*                Color</label></li>*/}
      {/*              <li className="noGraphic noLine">*/}
      {/*                <input id="chkTextAttributes" type="checkbox"/><label htmlFor="chkTextAttributes"*/}
      {/*                                                                      id="lblTextAttributes">Text*/}
      {/*                Attributes</label></li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*        <div className="lockSection noLine">*/}
      {/*          <div className="lockSectionHeader">*/}
      {/*            <h4 id="lblLockContent">Content</h4>*/}
      {/*          </div>*/}
      {/*          <div className="lockSectionBody">*/}
      {/*            <ul>*/}
      {/*              <li className="noGraphic noLine">*/}
      {/*                <input id="chkChangeText" type="checkbox"/><label htmlFor="chkChangeText" id="lblChangeText">Change*/}
      {/*                Text</label></li>*/}
      {/*              <li className="noText">*/}
      {/*                <input id="chkContentLocation" type="checkbox"/><label htmlFor="chkContentLocation"*/}
      {/*                                                                       id="lblContentLocation">Location</label>*/}
      {/*              </li>*/}
      {/*              <li className="noText">*/}
      {/*                <input id="chkContentDimension" type="checkbox"/><label htmlFor="chkContentDimension"*/}
      {/*                                                                        id="lblContentDimension">Dimension</label>*/}
      {/*              </li>*/}
      {/*              <li className="noText">*/}
      {/*                <input id="chkContentRotation" type="checkbox"/><label htmlFor="chkContentRotation"*/}
      {/*                                                                       id="lblContentRotation">Rotation</label>*/}
      {/*              </li>*/}
      {/*              <li className="noText">*/}
      {/*                <input id="chkReplaceGraphics" type="checkbox"/><label htmlFor="chkReplaceGraphics"*/}
      {/*                                                                       id="lblReplaceGraphics">Replace*/}
      {/*                Graphics</label></li>*/}
      {/*              <li>*/}
      {/*                <input id="chkAddRemoveContentObjects" type="checkbox"/><label htmlFor="chkAddRemoveContentObjects"*/}
      {/*                                                                               id="lblAddRemoveContentObjects">Add/Remove*/}
      {/*                Content Objects</label></li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*      <div className="modal-footer">*/}
      {/*        <button type="button" id="btnSaveLocks" className="btn btn-primary">Save</button>*/}
      {/*        <button type="button" id="btnCancelLocks" className="btn btn-default" data-dismiss="modal">Cancel</button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      {/*<div id="mnuImageSelection" className="modal fade" tabIndex="-1" role="dialog">*/}
      {/*  <div className="modal-dialog">*/}
      {/*    <div className="modal-content">*/}
      {/*      <div className="modal-header">*/}
      {/*        <button type="button" className="close" data-dismiss="modal"><i*/}
      {/*          className="icon-remove glyphicon glyphicon-remove"></i></button>*/}
      {/*        <h3 id="myModalLabel">Select Image</h3>*/}
      {/*      </div>*/}
      {/*      <div className="modal-body item-selector">*/}
      {/*        <div className="thumbnails item active">*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*          <div>*/}
      {/*            &nbsp;*/}
      {/*          </div>*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*        <div className="thumbnails item prev">*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*          <div>*/}
      {/*            &nbsp;*/}
      {/*          </div>*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*        <div className="thumbnails item next">*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*          <div>*/}
      {/*            &nbsp;*/}
      {/*          </div>*/}
      {/*          <div className="thumbnail-row">*/}
      {/*            <ul>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*              <li className="thumbnail-cell">*/}
      {/*                <a href="#" className="thumbnail">*/}
      {/*                  <img alt=""/>*/}
      {/*                </a>*/}
      {/*              </li>*/}
      {/*            </ul>*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*        <a className="left carousel-control text-control" id="prevImage">‹</a>*/}
      {/*        <a className="right carousel-control text-control" id="nextImage">›</a>*/}
      {/*      </div>*/}
      {/*      <div className="modal-footer">*/}
      {/*        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>*/}
      {/*        <button type="button" id="btnImageSelect" className="btn btn-primary">Select</button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/*<div style={{width:'100%'}}>*/}
      {/*  <div style={{width:'100%'}}>&nbsp;</div>*/}
      {/*</div>*/}
      <div className="uEdit-area" style={{width:'100%'}}>
        <div id="uEditContainer">
          <div id="uEditControl"></div>
          {/*<div id="bottomControlPanel" className="simple-controls-container">*/}
          {/*  <div style={{width:'75%'}}>*/}
          {/*    <div>*/}
          {/*      <button type="button" className="btn btn-default active" id="btnViewMode" title="Toggle Preview Mode">*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/ShowFramesOff.png')} style={{margin:'1px'}}/>*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/ShowFramesOn.png')} style={{ margin:'2px',display:'none' }}/>*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*    <div>*/}
          {/*      <button type="button" className="btn btn-default" id="btnFitPage" title="Zoom to Fit">*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/FitPage.png')} style={{margin:'1px'}}/>*/}
          {/*      </button>*/}
          {/*      <button type="button" className="btn btn-default" id="btnFillPage" title="Zoom to Fill">*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/FillPage.png')} style={{margin:'1px'}}/>*/}
          {/*      </button>*/}
          {/*      <input type="text" id="txtZoom"/>*/}
          {/*      &nbsp;*/}
          {/*      <a className="text-control" id="ancSliderDown" title="Zoom Out"><i*/}
          {/*        className="icon-minus glyphicon glyphicon-minus"></i></a>*/}
          {/*      &nbsp;*/}
          {/*      <div id="sldZoom"></div>*/}
          {/*      &nbsp;*/}
          {/*      <a className="text-control" id="ancSliderUp" title="Zoom In"><i*/}
          {/*        className="icon-plus glyphicon glyphicon-plus"></i></a>*/}
          {/*    </div>*/}
          {/*    <div style={{ paddingTop: '7px',paddingBottom:'7px' }}>*/}
          {/*      <a className="text-control" id="ancPreviousPage" title="Previous Page"><i*/}
          {/*        className="icon-chevron-left glyphicon glyphicon-chevron-left"></i></a>*/}
          {/*      <input type="text" id="txtCurrentPage" className="index-indicator" value="0"/>*/}
          {/*      <span id="spnPagesOutOf">/ 0</span>*/}
          {/*      <a className="text-control" id="ancNextPage" title="Next Page"><i*/}
          {/*        className="icon-chevron-right glyphicon glyphicon-chevron-right"></i></a>*/}
          {/*    </div>*/}
          {/*    <div style={{height:'15px',padding:'10px'}}></div>*/}
          {/*  </div>*/}
          {/*  <div style={{width:'25%',textAlign:'right'}}>*/}
          {/*    <div>*/}
          {/*      <button type="button" className="btn btn-default debug-tool" id="btnLock" href="#mnuLockOptions"*/}
          {/*              data-toggle="modal" title="Lock Options">*/}
          {/*        <i className="icon-lock glyphicon glyphicon-lock" style={{margin:'1px 3px 3px 3px'}}></i>*/}
          {/*      </button>*/}
          {/*      <button type="button" className="btn btn-default debug-tool" id="btnPreview" title="Preview">*/}
          {/*        <i className="icon-wrench glyphicon glyphicon-wrench" style={{margin:'1px 3px 3px 3px'}}></i>*/}
          {/*      </button>*/}
          {/*      <button type="button" className="btn btn-default debug-tool" id="btnSave"*/}
          {/*              title="Download XLIM Document">*/}
          {/*        <i className="icon-file glyphicon glyphicon-file" style={{margin:'1px 3px 3px 3px'}}></i>*/}
          {/*      </button>*/}
          {/*      <button type="button" className="btn btn-default" id="btnUndo" disabled title="Undo">*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/UndoSmallDisabled.png')}/>*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/UndoSmall.png')} style={{display:'none'}}/>*/}
          {/*      </button>*/}
          {/*      <button type="button" className="btn btn-default" id="btnRedo" disabled title="Redo">*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/RedoSmallDisabled.png')}/>*/}
          {/*        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/RedoSmall.png')} style={{display:'none'}}/>*/}
          {/*      </button>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div id="mnuPreviewValues" className="drop-menu simple-controls-container">*/}
          {/*  <div className="panel-no-title">*/}
          {/*    &nbsp;*/}
          {/*    <span className="panel-button"><i className="icon-remove glyphicon glyphicon-remove"></i></span>*/}
          {/*  </div>*/}
          {/*  <div className="panel-body">*/}
          {/*    <button type="button" className="btn btn-default" title="Show Preview Values" id="btnShowPreview">*/}
          {/*      <img src={require('../../../../../ustore-internal/static/uedit/images/icons/Graphic.png')} style={{margin:'4px'}}/>*/}
          {/*    </button>*/}
          {/*    &nbsp;*/}
          {/*    <a className="text-control" id="ancPreviousRecord" title="Previous Record"><i*/}
          {/*      className="icon-chevron-left glyphicon glyphicon-chevron-left"></i></a>*/}
          {/*    <input type="text" className="index-indicator" id="txtCurrentRecord" disabled value="0"/>*/}
          {/*    <span id="spnRecordOutOf">/ 0</span>*/}
          {/*    <a className="text-control" id="ancNextRecord" title="Next Record"><i*/}
          {/*      className="icon-chevron-right glyphicon glyphicon-chevron-right"></i></a>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
        {/*<div id="rightControlPanel">*/}
        {/*  <div className="hide-when-small">*/}
        {/*    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/uEditHDLogo.png')} style={{height:'50px',marginBottom:'10px'}}/>*/}
        {/*  </div>*/}
        {/*  <ul>*/}
        {/*    <li id="pnlToolbox" className="palette hide-when-small">*/}
        {/*      <ul>*/}
        {/*        <li className="panel-title text-control">*/}
        {/*          <span className="panel-title-text">Toolbox</span>*/}
        {/*          <span className="panel-button"><i*/}
        {/*            className="icon-chevron-up glyphicon glyphicon-chevron-up"></i></span>*/}
        {/*        </li>*/}
        {/*        <li className="panel-body">*/}
        {/*          <button type="button" className="btn btn-default large-icon-button" title="Add Text Box"*/}
        {/*                  id="btnAddTextBox">*/}
        {/*            <img src={require('../../../../../ustore-internal/static/uedit/images/icons/AddText.png')}/>*/}
        {/*          </button>*/}
        {/*          <button type="button" className="btn btn-default large-icon-button" title="Add Graphic Box"*/}
        {/*                  id="btnAddGraphicBox">*/}
        {/*            <img src={require('../../../../../ustore-internal/static/uedit/images/icons/AddGraphic.png')}/>*/}
        {/*          </button>*/}
        {/*          <button type="button" className="btn btn-default large-icon-button" title="Add Line Shape"*/}
        {/*                  id="btnAddLine">*/}
        {/*            <img src={require('../../../../../ustore-internal/static/uedit/images/icons/AddLine.png')}/>*/}
        {/*          </button>*/}
        {/*          <button type="button" className="btn btn-default large-icon-button" title="Delete Shape"*/}
        {/*                  id="btnDeleteBox">*/}
        {/*            <img src={require('../../../../../ustore-internal/static/uedit/images/icons/DeleteObject.png')}/>*/}
        {/*          </button>*/}
        {/*        </li>*/}
        {/*      </ul>*/}
        {/*    </li>*/}
        {/*    <li>*/}
        {/*      <ul>*/}
        {/*        <li id="pnlText" className="palette" style={{display:'none'}}>*/}
        {/*          <ul>*/}
        {/*            <li className="panel-title text-control">*/}
        {/*              <span className="panel-title-text">Text</span>*/}
        {/*              <span className="panel-button"><i className="icon-chevron-up glyphicon glyphicon-chevron-up"></i></span>*/}
        {/*            </li>*/}
        {/*            <li className="panel-body">*/}
        {/*              <ul>*/}
        {/*                <li className="text-feature">*/}
        {/*                  <ul>*/}
        {/*                    <li>*/}
        {/*                      <div className="combo" id="cmbFontFamily">*/}
        {/*                        <div className="combo-title combo-toggle">*/}
        {/*                          <div className="combo-value">Loading...</div>*/}
        {/*                          <div className="combo-caret">&nbsp;<a><b className="caret"></b></a></div>*/}
        {/*                        </div>*/}
        {/*                        <ul className="combo-menu" role="menu">*/}
        {/*                        </ul>*/}
        {/*                      </div>*/}
        {/*                    </li>*/}
        {/*                    <li>*/}
        {/*                      <div className="combo" id="cmbFontFace">*/}
        {/*                        <div className="combo-title combo-toggle">*/}
        {/*                          <div className="combo-value">Loading...</div>*/}
        {/*                          <div className="combo-caret">&nbsp;<a><b className="caret"></b></a></div>*/}
        {/*                        </div>*/}
        {/*                        <ul className="combo-menu" role="menu">*/}
        {/*                        </ul>*/}
        {/*                      </div>*/}
        {/*                      <span id="pnlFontSize">*/}
        {/*                                                    <label htmlFor="cmbFontSize"><img*/}
        {/*                                                      src="images/icons/TextSize.png"/></label>*/}
        {/*                                                    <div className="combo" id="cmbFontSize">*/}
        {/*                                                        <div className="combo-title combo-toggle">*/}
        {/*                                                            <div className="combo-value"></div><div*/}
        {/*                                                          className="combo-caret"><a><b*/}
        {/*                                                          className="caret"></b></a></div>*/}
        {/*                                                        </div>*/}
        {/*                                                        <ul className="combo-menu" role="menu">*/}
        {/*                                                            <li><a data-value="8">8 pt</a></li>*/}
        {/*                                                            <li><a data-value="9">9 pt</a></li>*/}
        {/*                                                            <li><a data-value="10">10 pt</a></li>*/}
        {/*                                                            <li><a data-value="12">12 pt</a></li>*/}
        {/*                                                            <li><a data-value="14">14 pt</a></li>*/}
        {/*                                                            <li><a data-value="18">18 pt</a></li>*/}
        {/*                                                            <li><a data-value="24">24 pt</a></li>*/}
        {/*                                                            <li><a data-value="30">30 pt</a></li>*/}
        {/*                                                            <li><a data-value="36">36 pt</a></li>*/}
        {/*                                                            <li><a data-value="48">48 pt</a></li>*/}
        {/*                                                            <li><a data-value="60">60 pt</a></li>*/}
        {/*                                                            <li><a data-value="72">72 pt</a></li>*/}
        {/*                                                            <li><a>other: <input type="text"*/}
        {/*                                                                                 className="combo-text"*/}
        {/*                                                                                 maxlength="7"/></a></li>*/}
        {/*                                                        </ul>*/}
        {/*                                                    </div>*/}
				{/*										</span>*/}
        {/*                    </li>*/}
        {/*                    <li>*/}
        {/*                      <button type="button" className="btn btn-default align-button small-icon-button active"*/}
        {/*                              data-align="1" title="Aligh Left">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/LeftAlign.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default align-button small-icon-button"*/}
        {/*                              data-align="2" title="Center">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/Center.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default align-button small-icon-button"*/}
        {/*                              data-align="3" title="Align Right">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/RightAlign.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default align-button small-icon-button"*/}
        {/*                              data-align="4" title="Justify">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/HJustify.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default valign-button small-icon-button active"*/}
        {/*                              data-align="1" title="Align Top">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/TopAlign.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default valign-button small-icon-button"*/}
        {/*                              data-align="2" title="Center">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/CenterAlign.png')}/>*/}
        {/*                      </button>*/}
        {/*                      <button type="button" className="btn btn-default valign-button small-icon-button"*/}
        {/*                              data-align="3" title="Align Bottom">*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/BottomAlign.png')}/>*/}
        {/*                      </button>*/}
        {/*                    </li>*/}
        {/*                  </ul>*/}
        {/*                </li>*/}
        {/*                <li className="text-feature">*/}
        {/*                  <ul>*/}
        {/*                    <li>*/}
        {/*                      <div id="colors" className="text-feature swatch-menu">*/}
        {/*                        Loading...*/}
        {/*                      </div>*/}
        {/*                      <button type="button" className="btn btn-default large-icon-button color-menu-button"*/}
        {/*                              title="Select Text Color" id="btnTextColorMenu" style={{verticalAlign:'top'}}>*/}
        {/*                        <img src={require('../../../../../ustore-internal/static/uedit/images/icons/ColorPalette.png')}/>*/}
        {/*                      </button>*/}
        {/*                    </li>*/}
        {/*                    <li id="textCO">*/}
        {/*                      <label htmlFor="cmbTextCO">Content:</label>*/}
        {/*                      <div className="combo" id="cmbTextCO" style={{width:'70%'}}>*/}
        {/*                        <div className="combo-title combo-toggle">*/}
        {/*                          <div className="combo-value">Loading...</div>*/}
        {/*                          <div className="combo-caret"><a><b className="caret"></b></a></div>*/}
        {/*                        </div>*/}
        {/*                        <ul className="combo-menu" role="menu">*/}
        {/*                        </ul>*/}
        {/*                      </div>*/}
        {/*                    </li>*/}
        {/*                  </ul>*/}
        {/*                </li>*/}
        {/*                <li className="image-feature">*/}
        {/*                  <label htmlFor="cmbImageCO" id="lblContent">Content:</label>*/}
        {/*                  <div className="combo" id="cmbImageCO" style={{width:'70%'}}>*/}
        {/*                    <div className="combo-title combo-toggle">*/}
        {/*                      <div className="combo-value">Loading...</div>*/}
        {/*                      <div className="combo-caret"><a><b className="caret"></b></a></div>*/}
        {/*                    </div>*/}
        {/*                    <ul className="combo-menu" role="menu">*/}
        {/*                    </ul>*/}
        {/*                  </div>*/}
        {/*                </li>*/}
        {/*                <li className="image-feature">*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" id="btnPlaceImage"*/}
        {/*                          href="#mnuImageSelection" data-toggle="modal" title="Place Image">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/SetGraphic.png')}/>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" id="btnFitPropAndCenter"*/}
        {/*                          title="Fit Image to Frame">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/FitImageToFrame.png')}/>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" id="btnFitFrameToImage"*/}
        {/*                          title="Fit Frame to Image">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/FitFrameToImage.png')}/>*/}
        {/*                  </button>*/}
        {/*                </li>*/}
        {/*              </ul>*/}
        {/*            </li>*/}
        {/*          </ul>*/}
        {/*        </li>*/}

        {/*        <li id="pnlBox" className="palette" style={{ display:'none' }}>*/}
        {/*          <ul>*/}
        {/*            <li className="panel-title text-control">*/}
        {/*              <span className="panel-title-text" id="spnShape">Shape</span>*/}
        {/*              <span className="panel-button"><i className="icon-chevron-up glyphicon glyphicon-chevron-up"></i></span>*/}
        {/*            </li>*/}
        {/*            <li className="panel-body">*/}
        {/*              <ul>*/}
        {/*                <li>*/}
        {/*                  <button type="button" className="btn btn-default color-menu-button"*/}
        {/*                          id="btnBackground"*/}
        {/*                          title="Background Color">*/}
        {/*                                            <span>*/}
        {/*                                                <img src={require('../../../../../ustore-internal/static/uedit/images/icons/SwatchContentBase.png')} alt=""/>*/}
        {/*                                                <div id="backgroundColorMask"></div>*/}
        {/*                                                <img id="backgroundColorNone"*/}
        {/*                                                     src="images/icons/SwatchContentNoneColorV.png"/>*/}
        {/*                                            </span>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default color-menu-button" id="btnBorder"*/}
        {/*                          title="Border Color">*/}
        {/*                                            <span>*/}
        {/*                                                <img src={require('../../../../../ustore-internal/static/uedit/images/icons/SwatchStrokeBase.png')} alt=""/>*/}
        {/*                                                <div id="strokeColorMask"></div>*/}
        {/*                                                <img id="strokeColorNone"*/}
        {/*                                                     src="images/icons/SwatchStrokeNoneColorV.png"/>*/}
        {/*                                            </span>*/}
        {/*                  </button>*/}
        {/*                  <label id="lblBorderWeight" htmlFor="cmbBorderWeight" title="Border Weight"><img*/}
        {/*                    src="images/icons/StrokeWeight.png" style={{ verticalAlign:'top',marginTop:'1px' }}/></label>*/}
        {/*                  <div className="combo" id="cmbBorderWeight">*/}
        {/*                    <div className="combo-title combo-toggle">*/}
        {/*                      <div className="combo-value"></div>*/}
        {/*                      <div className="combo-caret"><a><b className="caret"></b></a></div>*/}
        {/*                    </div>*/}
        {/*                    <ul className="combo-menu" role="menu">*/}
        {/*                      <li><a data-value="0">0 pt</a></li>*/}
        {/*                      <li><a data-value="1">1 pt</a></li>*/}
        {/*                      <li><a data-value="2">2 pt</a></li>*/}
        {/*                      <li><a data-value="3">3 pt</a></li>*/}
        {/*                      <li><a data-value="4">4 pt</a></li>*/}
        {/*                      <li><a data-value="5">5 pt</a></li>*/}
        {/*                      <li><a data-value="6">6 pt</a></li>*/}
        {/*                      <li><a data-value="7">7 pt</a></li>*/}
        {/*                      <li><a data-value="8">8 pt</a></li>*/}
        {/*                      <li><a data-value="9">9 pt</a></li>*/}
        {/*                      <li><a data-value="10">10 pt</a></li>*/}
        {/*                      <li><a data-value="20">20 pt</a></li>*/}
        {/*                      <li><a>other: <input type="text" className="combo-text" maxlength="7"/></a></li>*/}
        {/*                    </ul>*/}
        {/*                  </div>*/}
        {/*                </li>*/}
        {/*                <li>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" title="Bring to Front"*/}
        {/*                          id="btnBringToFront">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/BringToFront.png')} alt=""/>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" title="Bring Forward"*/}
        {/*                          id="btnBringForward">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/BringForward.png')} alt=""/>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" title="Send Backward"*/}
        {/*                          id="btnSendBackward">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/SendBackward.png')} alt=""/>*/}
        {/*                  </button>*/}
        {/*                  <button type="button" className="btn btn-default small-icon-button" title="Send to Back"*/}
        {/*                          id="btnSendToBack">*/}
        {/*                    <img src={require('../../../../../ustore-internal/static/uedit/images/icons/SendToBack.png')} alt=""/>*/}
        {/*                  </button>*/}
        {/*                </li>*/}
        {/*              </ul>*/}
        {/*            </li>*/}
        {/*          </ul>*/}
        {/*        </li>*/}

        {/*      </ul>*/}
        {/*    </li>*/}
        {/*    <div id="mnuColorSelector" className="drop-menu">*/}
        {/*      <div className="panel-body">*/}
        {/*        <div className="swatch-menu">*/}
        {/*        </div>*/}
        {/*        <div className="color-picker">*/}
        {/*          <img src={require('../../../../../ustore-internal/static/uedit/images/icons/picker.png')} alt=""/>*/}
        {/*          <span>More...</span>*/}
        {/*        </div>*/}
        {/*        <div className="additional-colors">*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </ul>*/}
        {/*</div>*/}
      </div>
    </div>
  )
}

export default UEditProduct
