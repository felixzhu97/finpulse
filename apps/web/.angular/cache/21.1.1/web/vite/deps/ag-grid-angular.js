import {
  BaseComponentWrapper,
  VanillaFrameworkOverrides,
  _BOOLEAN_MIXED_GRID_OPTIONS,
  _combineAttributesAndGridOptions,
  _processOnChange,
  _removeFromParent,
  createGrid
} from "./chunk-2RTOEMUW.js";
import {
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵgetInheritedFactory,
  ɵɵinject
} from "./chunk-P2WURO3N.js";
import "./chunk-WDMUDEB6.js";

// ../../node_modules/.pnpm/ag-grid-angular@33.3.2_@angular+common@21.1.1_@angular+core@21.1.1_@angular+compiler@21_637374de4c4bf64c6aac2c89c39308d8/node_modules/ag-grid-angular/fesm2022/ag-grid-angular.mjs
var AgComponentContainer = class _AgComponentContainer {
  constructor() {
    this.vcr = inject(ViewContainerRef);
  }
  static {
    this.ɵfac = function AgComponentContainer_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AgComponentContainer)();
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _AgComponentContainer,
      selectors: [["ag-component-container"]],
      standalone: false,
      decls: 0,
      vars: 0,
      template: function AgComponentContainer_Template(rf, ctx) {
      },
      encapsulation: 2
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AgComponentContainer, [{
    type: Component,
    args: [{
      selector: "ag-component-container",
      template: ""
    }]
  }], null, null);
})();
var NUM_SHARDS = 16;
var shardIdx = 0;
function createComponentContainers(vcr) {
  const containerMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < NUM_SHARDS; i++) {
    const container = vcr.createComponent(AgComponentContainer);
    containerMap.set(i, container);
    _removeFromParent(container.location.nativeElement);
  }
  return containerMap;
}
var runOutsideMethods = /* @__PURE__ */ new Set(["doesFilterPass", "isFilterActive"]);
var AngularFrameworkComponentWrapper = class _AngularFrameworkComponentWrapper extends BaseComponentWrapper {
  setViewContainerRef(viewContainerRef, angularFrameworkOverrides) {
    this.viewContainerRef = viewContainerRef;
    this.angularFrameworkOverrides = angularFrameworkOverrides;
  }
  createWrapper(OriginalConstructor) {
    const angularFrameworkOverrides = this.angularFrameworkOverrides;
    const that = this;
    that.compShards ??= createComponentContainers(this.viewContainerRef);
    class DynamicAgNg2Component extends BaseGuiComponent {
      init(params) {
        angularFrameworkOverrides.runInsideAngular(() => {
          super.init(params);
          this._componentRef.changeDetectorRef.detectChanges();
        });
      }
      createComponent() {
        return that.createComponent(OriginalConstructor);
      }
      hasMethod(name) {
        return wrapper.getFrameworkComponentInstance()[name] != null;
      }
      callMethod(name, args) {
        const componentRef = this.getFrameworkComponentInstance();
        const methodCall = componentRef[name];
        if (runOutsideMethods.has(name)) {
          return methodCall.apply(componentRef, args);
        }
        return angularFrameworkOverrides.runInsideAngular(() => methodCall.apply(componentRef, args));
      }
      addMethod(name, callback) {
        wrapper[name] = callback;
      }
    }
    const wrapper = new DynamicAgNg2Component();
    return wrapper;
  }
  createComponent(componentType) {
    shardIdx = (shardIdx + 1) % NUM_SHARDS;
    const container = this.compShards.get(shardIdx);
    return container.instance.vcr.createComponent(componentType);
  }
  static {
    this.ɵfac = /* @__PURE__ */ (() => {
      let ɵAngularFrameworkComponentWrapper_BaseFactory;
      return function AngularFrameworkComponentWrapper_Factory(__ngFactoryType__) {
        return (ɵAngularFrameworkComponentWrapper_BaseFactory || (ɵAngularFrameworkComponentWrapper_BaseFactory = ɵɵgetInheritedFactory(_AngularFrameworkComponentWrapper)))(__ngFactoryType__ || _AngularFrameworkComponentWrapper);
      };
    })();
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _AngularFrameworkComponentWrapper,
      factory: _AngularFrameworkComponentWrapper.ɵfac
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFrameworkComponentWrapper, [{
    type: Injectable
  }], null, null);
})();
var BaseGuiComponent = class {
  init(params) {
    this._params = params;
    this._componentRef = this.createComponent();
    this._agAwareComponent = this._componentRef.instance;
    this._frameworkComponentInstance = this._componentRef.instance;
    this._eGui = this._componentRef.location.nativeElement;
    _removeFromParent(this._eGui);
    this._agAwareComponent.agInit(this._params);
  }
  getGui() {
    return this._eGui;
  }
  /** `getGui()` returns the `ng-component` element. This returns the actual root element. */
  getRootElement() {
    const firstChild = this._eGui.firstChild;
    return firstChild;
  }
  destroy() {
    if (this._frameworkComponentInstance && typeof this._frameworkComponentInstance.destroy === "function") {
      this._frameworkComponentInstance.destroy();
    }
    this._componentRef?.destroy();
  }
  getFrameworkComponentInstance() {
    return this._frameworkComponentInstance;
  }
};
var AngularFrameworkEventListenerService = class {
  constructor(frameworkOverrides) {
    this.frameworkOverrides = frameworkOverrides;
    this.wrappedListeners = /* @__PURE__ */ new Map();
    this.wrappedGlobalListeners = /* @__PURE__ */ new Map();
  }
  wrap(eventType, userListener) {
    const {
      frameworkOverrides,
      wrappedListeners
    } = this;
    let listener = userListener;
    if (frameworkOverrides.shouldWrapOutgoing) {
      listener = (event) => {
        frameworkOverrides.wrapOutgoing(() => userListener(event));
      };
      let eventListeners = wrappedListeners.get(eventType);
      if (!eventListeners) {
        eventListeners = /* @__PURE__ */ new Map();
        wrappedListeners.set(eventType, eventListeners);
      }
      eventListeners.set(userListener, listener);
    }
    return listener;
  }
  wrapGlobal(userListener) {
    const {
      frameworkOverrides,
      wrappedGlobalListeners
    } = this;
    let listener = userListener;
    if (frameworkOverrides.shouldWrapOutgoing) {
      listener = (eventType, event) => {
        frameworkOverrides.wrapOutgoing(() => userListener(eventType, event));
      };
      wrappedGlobalListeners.set(userListener, listener);
    }
    return listener;
  }
  unwrap(eventType, userListener) {
    const {
      wrappedListeners
    } = this;
    const eventListeners = wrappedListeners.get(eventType);
    if (eventListeners) {
      const wrapped = eventListeners.get(userListener);
      if (wrapped) {
        eventListeners.delete(userListener);
        if (eventListeners.size === 0) {
          wrappedListeners.delete(eventType);
        }
        return wrapped;
      }
    }
    return userListener;
  }
  unwrapGlobal(userListener) {
    const {
      wrappedGlobalListeners
    } = this;
    const wrapped = wrappedGlobalListeners.get(userListener);
    if (wrapped) {
      wrappedGlobalListeners.delete(userListener);
      return wrapped;
    }
    return userListener;
  }
};
var AngularFrameworkOverrides = class _AngularFrameworkOverrides extends VanillaFrameworkOverrides {
  constructor(_ngZone) {
    super("angular");
    this._ngZone = _ngZone;
    this.batchFrameworkComps = true;
    this.isRunningWithinTestZone = false;
    this.wrapIncoming = (callback, source) => this.runOutside(callback, source);
    this.wrapOutgoing = (callback) => this.runInsideAngular(callback);
    this.isRunningWithinTestZone = window?.AG_GRID_UNDER_TEST ?? !!window?.Zone?.AsyncTestZoneSpec;
    if (!this._ngZone) {
      this.runOutside = (callback) => callback();
    } else if (this.isRunningWithinTestZone) {
      this.runOutside = (callback, source) => {
        if (source === "resize-observer" || source === "popupPositioning") {
          return this._ngZone.runOutsideAngular(callback);
        }
        return callback();
      };
    } else {
      this.runOutside = (callback) => this._ngZone.runOutsideAngular(callback);
    }
  }
  /**
   * The shouldWrapOutgoing property is used to determine if events should be run outside of Angular or not.
   * If an event handler is registered outside of Angular then we should not wrap the event handler
   * with runInsideAngular() as the user may not have wanted this.
   * This is also used to not wrap internal event listeners that are registered with RowNodes and Columns.
   */
  get shouldWrapOutgoing() {
    return this._ngZone && NgZone.isInAngularZone();
  }
  createLocalEventListenerWrapper(existingFrameworkEventListenerService, localEventService) {
    if (this.shouldWrapOutgoing) {
      return existingFrameworkEventListenerService ?? (() => {
        localEventService.setFrameworkOverrides(this);
        return new AngularFrameworkEventListenerService(this);
      })();
    }
    return void 0;
  }
  createGlobalEventListenerWrapper() {
    return new AngularFrameworkEventListenerService(this);
  }
  isFrameworkComponent(comp) {
    if (!comp) {
      return false;
    }
    const prototype = comp.prototype;
    return prototype && "agInit" in prototype;
  }
  runInsideAngular(callback) {
    if (!this._ngZone || NgZone.isInAngularZone()) {
      return callback();
    }
    return this._ngZone.run(callback);
  }
  runOutsideAngular(callback, source) {
    return this.runOutside(callback, source);
  }
  static {
    this.ɵfac = function AngularFrameworkOverrides_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AngularFrameworkOverrides)(ɵɵinject(NgZone));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _AngularFrameworkOverrides,
      factory: _AngularFrameworkOverrides.ɵfac
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AngularFrameworkOverrides, [{
    type: Injectable
  }], () => [{
    type: NgZone
  }], null);
})();
var AgGridAngular = class _AgGridAngular {
  constructor(elementDef, _viewContainerRef, _angularFrameworkOverrides, _frameworkCompWrapper) {
    this._viewContainerRef = _viewContainerRef;
    this._angularFrameworkOverrides = _angularFrameworkOverrides;
    this._frameworkCompWrapper = _frameworkCompWrapper;
    this._initialised = false;
    this._destroyed = false;
    this._holdEvents = true;
    this._fullyReady = new Promise((resolve) => {
      this._resolveFullyReady = resolve;
    });
    this.statusBar = void 0;
    this.sideBar = void 0;
    this.suppressContextMenu = void 0;
    this.preventDefaultOnContextMenu = void 0;
    this.allowContextMenuWithControlKey = void 0;
    this.columnMenu = void 0;
    this.suppressMenuHide = void 0;
    this.enableBrowserTooltips = void 0;
    this.tooltipTrigger = void 0;
    this.tooltipShowDelay = void 0;
    this.tooltipHideDelay = void 0;
    this.tooltipMouseTrack = void 0;
    this.tooltipShowMode = void 0;
    this.tooltipInteraction = void 0;
    this.popupParent = void 0;
    this.copyHeadersToClipboard = void 0;
    this.copyGroupHeadersToClipboard = void 0;
    this.clipboardDelimiter = void 0;
    this.suppressCopyRowsToClipboard = void 0;
    this.suppressCopySingleCellRanges = void 0;
    this.suppressLastEmptyLineOnPaste = void 0;
    this.suppressClipboardPaste = void 0;
    this.suppressClipboardApi = void 0;
    this.suppressCutToClipboard = void 0;
    this.columnDefs = void 0;
    this.defaultColDef = void 0;
    this.defaultColGroupDef = void 0;
    this.columnTypes = void 0;
    this.dataTypeDefinitions = void 0;
    this.maintainColumnOrder = void 0;
    this.enableStrictPivotColumnOrder = void 0;
    this.suppressFieldDotNotation = void 0;
    this.headerHeight = void 0;
    this.groupHeaderHeight = void 0;
    this.floatingFiltersHeight = void 0;
    this.pivotHeaderHeight = void 0;
    this.pivotGroupHeaderHeight = void 0;
    this.allowDragFromColumnsToolPanel = void 0;
    this.suppressMovableColumns = void 0;
    this.suppressColumnMoveAnimation = void 0;
    this.suppressMoveWhenColumnDragging = void 0;
    this.suppressDragLeaveHidesColumns = void 0;
    this.suppressGroupChangesColumnVisibility = void 0;
    this.suppressMakeColumnVisibleAfterUnGroup = void 0;
    this.suppressRowGroupHidesColumns = void 0;
    this.colResizeDefault = void 0;
    this.suppressAutoSize = void 0;
    this.autoSizePadding = void 0;
    this.skipHeaderOnAutoSize = void 0;
    this.autoSizeStrategy = void 0;
    this.components = void 0;
    this.editType = void 0;
    this.singleClickEdit = void 0;
    this.suppressClickEdit = void 0;
    this.readOnlyEdit = void 0;
    this.stopEditingWhenCellsLoseFocus = void 0;
    this.enterNavigatesVertically = void 0;
    this.enterNavigatesVerticallyAfterEdit = void 0;
    this.enableCellEditingOnBackspace = void 0;
    this.undoRedoCellEditing = void 0;
    this.undoRedoCellEditingLimit = void 0;
    this.defaultCsvExportParams = void 0;
    this.suppressCsvExport = void 0;
    this.defaultExcelExportParams = void 0;
    this.suppressExcelExport = void 0;
    this.excelStyles = void 0;
    this.findSearchValue = void 0;
    this.findOptions = void 0;
    this.quickFilterText = void 0;
    this.cacheQuickFilter = void 0;
    this.includeHiddenColumnsInQuickFilter = void 0;
    this.quickFilterParser = void 0;
    this.quickFilterMatcher = void 0;
    this.applyQuickFilterBeforePivotOrAgg = void 0;
    this.excludeChildrenWhenTreeDataFiltering = void 0;
    this.enableAdvancedFilter = void 0;
    this.alwaysPassFilter = void 0;
    this.includeHiddenColumnsInAdvancedFilter = void 0;
    this.advancedFilterParent = void 0;
    this.advancedFilterBuilderParams = void 0;
    this.suppressAdvancedFilterEval = void 0;
    this.suppressSetFilterByDefault = void 0;
    this.enableCharts = void 0;
    this.chartThemes = void 0;
    this.customChartThemes = void 0;
    this.chartThemeOverrides = void 0;
    this.chartToolPanelsDef = void 0;
    this.chartMenuItems = void 0;
    this.loadingCellRenderer = void 0;
    this.loadingCellRendererParams = void 0;
    this.loadingCellRendererSelector = void 0;
    this.localeText = void 0;
    this.masterDetail = void 0;
    this.keepDetailRows = void 0;
    this.keepDetailRowsCount = void 0;
    this.detailCellRenderer = void 0;
    this.detailCellRendererParams = void 0;
    this.detailRowHeight = void 0;
    this.detailRowAutoHeight = void 0;
    this.context = void 0;
    this.alignedGrids = void 0;
    this.tabIndex = void 0;
    this.rowBuffer = void 0;
    this.valueCache = void 0;
    this.valueCacheNeverExpires = void 0;
    this.enableCellExpressions = void 0;
    this.suppressTouch = void 0;
    this.suppressFocusAfterRefresh = void 0;
    this.suppressBrowserResizeObserver = void 0;
    this.suppressPropertyNamesCheck = void 0;
    this.suppressChangeDetection = void 0;
    this.debug = void 0;
    this.loading = void 0;
    this.overlayLoadingTemplate = void 0;
    this.loadingOverlayComponent = void 0;
    this.loadingOverlayComponentParams = void 0;
    this.suppressLoadingOverlay = void 0;
    this.overlayNoRowsTemplate = void 0;
    this.noRowsOverlayComponent = void 0;
    this.noRowsOverlayComponentParams = void 0;
    this.suppressNoRowsOverlay = void 0;
    this.pagination = void 0;
    this.paginationPageSize = void 0;
    this.paginationPageSizeSelector = void 0;
    this.paginationAutoPageSize = void 0;
    this.paginateChildRows = void 0;
    this.suppressPaginationPanel = void 0;
    this.pivotMode = void 0;
    this.pivotPanelShow = void 0;
    this.pivotMaxGeneratedColumns = void 0;
    this.pivotDefaultExpanded = void 0;
    this.pivotColumnGroupTotals = void 0;
    this.pivotRowTotals = void 0;
    this.pivotSuppressAutoColumn = void 0;
    this.suppressExpandablePivotGroups = void 0;
    this.functionsReadOnly = void 0;
    this.aggFuncs = void 0;
    this.suppressAggFuncInHeader = void 0;
    this.alwaysAggregateAtRootLevel = void 0;
    this.aggregateOnlyChangedColumns = void 0;
    this.suppressAggFilteredOnly = void 0;
    this.removePivotHeaderRowWhenSingleValueColumn = void 0;
    this.animateRows = void 0;
    this.cellFlashDuration = void 0;
    this.cellFadeDuration = void 0;
    this.allowShowChangeAfterFilter = void 0;
    this.domLayout = void 0;
    this.ensureDomOrder = void 0;
    this.enableCellSpan = void 0;
    this.enableRtl = void 0;
    this.suppressColumnVirtualisation = void 0;
    this.suppressMaxRenderedRowRestriction = void 0;
    this.suppressRowVirtualisation = void 0;
    this.rowDragManaged = void 0;
    this.suppressRowDrag = void 0;
    this.suppressMoveWhenRowDragging = void 0;
    this.rowDragEntireRow = void 0;
    this.rowDragMultiRow = void 0;
    this.rowDragText = void 0;
    this.dragAndDropImageComponent = void 0;
    this.dragAndDropImageComponentParams = void 0;
    this.fullWidthCellRenderer = void 0;
    this.fullWidthCellRendererParams = void 0;
    this.embedFullWidthRows = void 0;
    this.groupDisplayType = void 0;
    this.groupDefaultExpanded = void 0;
    this.autoGroupColumnDef = void 0;
    this.groupMaintainOrder = void 0;
    this.groupSelectsChildren = void 0;
    this.groupLockGroupColumns = void 0;
    this.groupAggFiltering = void 0;
    this.groupTotalRow = void 0;
    this.grandTotalRow = void 0;
    this.suppressStickyTotalRow = void 0;
    this.groupSuppressBlankHeader = void 0;
    this.groupSelectsFiltered = void 0;
    this.showOpenedGroup = void 0;
    this.groupHideParentOfSingleChild = void 0;
    this.groupRemoveSingleChildren = void 0;
    this.groupRemoveLowestSingleChildren = void 0;
    this.groupHideOpenParents = void 0;
    this.groupAllowUnbalanced = void 0;
    this.rowGroupPanelShow = void 0;
    this.groupRowRenderer = void 0;
    this.groupRowRendererParams = void 0;
    this.treeData = void 0;
    this.treeDataChildrenField = void 0;
    this.treeDataParentIdField = void 0;
    this.rowGroupPanelSuppressSort = void 0;
    this.suppressGroupRowsSticky = void 0;
    this.pinnedTopRowData = void 0;
    this.pinnedBottomRowData = void 0;
    this.enableRowPinning = void 0;
    this.isRowPinnable = void 0;
    this.isRowPinned = void 0;
    this.rowModelType = void 0;
    this.rowData = void 0;
    this.asyncTransactionWaitMillis = void 0;
    this.suppressModelUpdateAfterUpdateTransaction = void 0;
    this.datasource = void 0;
    this.cacheOverflowSize = void 0;
    this.infiniteInitialRowCount = void 0;
    this.serverSideInitialRowCount = void 0;
    this.suppressServerSideFullWidthLoadingRow = void 0;
    this.cacheBlockSize = void 0;
    this.maxBlocksInCache = void 0;
    this.maxConcurrentDatasourceRequests = void 0;
    this.blockLoadDebounceMillis = void 0;
    this.purgeClosedRowNodes = void 0;
    this.serverSideDatasource = void 0;
    this.serverSideSortAllLevels = void 0;
    this.serverSideEnableClientSideSort = void 0;
    this.serverSideOnlyRefreshFilteredGroups = void 0;
    this.serverSidePivotResultFieldSeparator = void 0;
    this.viewportDatasource = void 0;
    this.viewportRowModelPageSize = void 0;
    this.viewportRowModelBufferSize = void 0;
    this.alwaysShowHorizontalScroll = void 0;
    this.alwaysShowVerticalScroll = void 0;
    this.debounceVerticalScrollbar = void 0;
    this.suppressHorizontalScroll = void 0;
    this.suppressScrollOnNewData = void 0;
    this.suppressScrollWhenPopupsAreOpen = void 0;
    this.suppressAnimationFrame = void 0;
    this.suppressMiddleClickScrolls = void 0;
    this.suppressPreventDefaultOnMouseWheel = void 0;
    this.scrollbarWidth = void 0;
    this.rowSelection = void 0;
    this.cellSelection = void 0;
    this.rowMultiSelectWithClick = void 0;
    this.suppressRowDeselection = void 0;
    this.suppressRowClickSelection = void 0;
    this.suppressCellFocus = void 0;
    this.suppressHeaderFocus = void 0;
    this.selectionColumnDef = void 0;
    this.rowNumbers = void 0;
    this.suppressMultiRangeSelection = void 0;
    this.enableCellTextSelection = void 0;
    this.enableRangeSelection = void 0;
    this.enableRangeHandle = void 0;
    this.enableFillHandle = void 0;
    this.fillHandleDirection = void 0;
    this.suppressClearOnFillReduction = void 0;
    this.sortingOrder = void 0;
    this.accentedSort = void 0;
    this.unSortIcon = void 0;
    this.suppressMultiSort = void 0;
    this.alwaysMultiSort = void 0;
    this.multiSortKey = void 0;
    this.suppressMaintainUnsortedOrder = void 0;
    this.icons = void 0;
    this.rowHeight = void 0;
    this.rowStyle = void 0;
    this.rowClass = void 0;
    this.rowClassRules = void 0;
    this.suppressRowHoverHighlight = void 0;
    this.suppressRowTransform = void 0;
    this.columnHoverHighlight = void 0;
    this.gridId = void 0;
    this.deltaSort = void 0;
    this.treeDataDisplayType = void 0;
    this.enableGroupEdit = void 0;
    this.initialState = void 0;
    this.theme = void 0;
    this.loadThemeGoogleFonts = void 0;
    this.themeCssLayer = void 0;
    this.styleNonce = void 0;
    this.themeStyleContainer = void 0;
    this.getContextMenuItems = void 0;
    this.getMainMenuItems = void 0;
    this.postProcessPopup = void 0;
    this.processUnpinnedColumns = void 0;
    this.processCellForClipboard = void 0;
    this.processHeaderForClipboard = void 0;
    this.processGroupHeaderForClipboard = void 0;
    this.processCellFromClipboard = void 0;
    this.sendToClipboard = void 0;
    this.processDataFromClipboard = void 0;
    this.isExternalFilterPresent = void 0;
    this.doesExternalFilterPass = void 0;
    this.getChartToolbarItems = void 0;
    this.createChartContainer = void 0;
    this.focusGridInnerElement = void 0;
    this.navigateToNextHeader = void 0;
    this.tabToNextHeader = void 0;
    this.navigateToNextCell = void 0;
    this.tabToNextCell = void 0;
    this.getLocaleText = void 0;
    this.getDocument = void 0;
    this.paginationNumberFormatter = void 0;
    this.getGroupRowAgg = void 0;
    this.isGroupOpenByDefault = void 0;
    this.initialGroupOrderComparator = void 0;
    this.processPivotResultColDef = void 0;
    this.processPivotResultColGroupDef = void 0;
    this.getDataPath = void 0;
    this.getChildCount = void 0;
    this.getServerSideGroupLevelParams = void 0;
    this.isServerSideGroupOpenByDefault = void 0;
    this.isApplyServerSideTransaction = void 0;
    this.isServerSideGroup = void 0;
    this.getServerSideGroupKey = void 0;
    this.getBusinessKeyForNode = void 0;
    this.getRowId = void 0;
    this.resetRowDataOnUpdate = void 0;
    this.processRowPostCreate = void 0;
    this.isRowSelectable = void 0;
    this.isRowMaster = void 0;
    this.fillOperation = void 0;
    this.postSortRows = void 0;
    this.getRowStyle = void 0;
    this.getRowClass = void 0;
    this.getRowHeight = void 0;
    this.isFullWidthRow = void 0;
    this.toolPanelVisibleChanged = new EventEmitter();
    this.toolPanelSizeChanged = new EventEmitter();
    this.columnMenuVisibleChanged = new EventEmitter();
    this.contextMenuVisibleChanged = new EventEmitter();
    this.cutStart = new EventEmitter();
    this.cutEnd = new EventEmitter();
    this.pasteStart = new EventEmitter();
    this.pasteEnd = new EventEmitter();
    this.columnVisible = new EventEmitter();
    this.columnPinned = new EventEmitter();
    this.columnResized = new EventEmitter();
    this.columnMoved = new EventEmitter();
    this.columnValueChanged = new EventEmitter();
    this.columnPivotModeChanged = new EventEmitter();
    this.columnPivotChanged = new EventEmitter();
    this.columnGroupOpened = new EventEmitter();
    this.newColumnsLoaded = new EventEmitter();
    this.gridColumnsChanged = new EventEmitter();
    this.displayedColumnsChanged = new EventEmitter();
    this.virtualColumnsChanged = new EventEmitter();
    this.columnEverythingChanged = new EventEmitter();
    this.columnHeaderMouseOver = new EventEmitter();
    this.columnHeaderMouseLeave = new EventEmitter();
    this.columnHeaderClicked = new EventEmitter();
    this.columnHeaderContextMenu = new EventEmitter();
    this.componentStateChanged = new EventEmitter();
    this.cellValueChanged = new EventEmitter();
    this.cellEditRequest = new EventEmitter();
    this.rowValueChanged = new EventEmitter();
    this.cellEditingStarted = new EventEmitter();
    this.cellEditingStopped = new EventEmitter();
    this.rowEditingStarted = new EventEmitter();
    this.rowEditingStopped = new EventEmitter();
    this.undoStarted = new EventEmitter();
    this.undoEnded = new EventEmitter();
    this.redoStarted = new EventEmitter();
    this.redoEnded = new EventEmitter();
    this.cellSelectionDeleteStart = new EventEmitter();
    this.cellSelectionDeleteEnd = new EventEmitter();
    this.rangeDeleteStart = new EventEmitter();
    this.rangeDeleteEnd = new EventEmitter();
    this.fillStart = new EventEmitter();
    this.fillEnd = new EventEmitter();
    this.filterOpened = new EventEmitter();
    this.filterChanged = new EventEmitter();
    this.filterModified = new EventEmitter();
    this.advancedFilterBuilderVisibleChanged = new EventEmitter();
    this.findChanged = new EventEmitter();
    this.chartCreated = new EventEmitter();
    this.chartRangeSelectionChanged = new EventEmitter();
    this.chartOptionsChanged = new EventEmitter();
    this.chartDestroyed = new EventEmitter();
    this.cellKeyDown = new EventEmitter();
    this.gridReady = new EventEmitter();
    this.firstDataRendered = new EventEmitter();
    this.gridSizeChanged = new EventEmitter();
    this.modelUpdated = new EventEmitter();
    this.virtualRowRemoved = new EventEmitter();
    this.viewportChanged = new EventEmitter();
    this.bodyScroll = new EventEmitter();
    this.bodyScrollEnd = new EventEmitter();
    this.dragStarted = new EventEmitter();
    this.dragStopped = new EventEmitter();
    this.dragCancelled = new EventEmitter();
    this.stateUpdated = new EventEmitter();
    this.paginationChanged = new EventEmitter();
    this.rowDragEnter = new EventEmitter();
    this.rowDragMove = new EventEmitter();
    this.rowDragLeave = new EventEmitter();
    this.rowDragEnd = new EventEmitter();
    this.rowDragCancel = new EventEmitter();
    this.rowResizeStarted = new EventEmitter();
    this.rowResizeEnded = new EventEmitter();
    this.columnRowGroupChanged = new EventEmitter();
    this.rowGroupOpened = new EventEmitter();
    this.expandOrCollapseAll = new EventEmitter();
    this.pivotMaxColumnsExceeded = new EventEmitter();
    this.pinnedRowDataChanged = new EventEmitter();
    this.pinnedRowsChanged = new EventEmitter();
    this.rowDataUpdated = new EventEmitter();
    this.asyncTransactionsFlushed = new EventEmitter();
    this.storeRefreshed = new EventEmitter();
    this.headerFocused = new EventEmitter();
    this.cellClicked = new EventEmitter();
    this.cellDoubleClicked = new EventEmitter();
    this.cellFocused = new EventEmitter();
    this.cellMouseOver = new EventEmitter();
    this.cellMouseOut = new EventEmitter();
    this.cellMouseDown = new EventEmitter();
    this.rowClicked = new EventEmitter();
    this.rowDoubleClicked = new EventEmitter();
    this.rowSelected = new EventEmitter();
    this.selectionChanged = new EventEmitter();
    this.cellContextMenu = new EventEmitter();
    this.rangeSelectionChanged = new EventEmitter();
    this.cellSelectionChanged = new EventEmitter();
    this.tooltipShow = new EventEmitter();
    this.tooltipHide = new EventEmitter();
    this.sortChanged = new EventEmitter();
    this._nativeElement = elementDef.nativeElement;
    this._fullyReady.then(() => {
      this._holdEvents = false;
    });
  }
  ngAfterViewInit() {
    this._angularFrameworkOverrides.runOutsideAngular(() => {
      this._frameworkCompWrapper.setViewContainerRef(this._viewContainerRef, this._angularFrameworkOverrides);
      const gridOptionKeys = Object.keys(this).filter((key) => !(key.startsWith("_") || key == "gridOptions" || key == "modules" || this[key] instanceof EventEmitter));
      const coercedGridOptions = {};
      gridOptionKeys.forEach((key) => {
        const valueToUse = getValueOrCoercedValue(key, this[key]);
        coercedGridOptions[key] = valueToUse;
      });
      const mergedGridOps = _combineAttributesAndGridOptions(this.gridOptions, coercedGridOptions, gridOptionKeys);
      const gridParams = {
        globalListener: this.globalListener.bind(this),
        frameworkOverrides: this._angularFrameworkOverrides,
        providedBeanInstances: {
          frameworkCompWrapper: this._frameworkCompWrapper
        },
        modules: this.modules || [],
        setThemeOnGridDiv: true
      };
      const api = createGrid(this._nativeElement, mergedGridOps, gridParams);
      if (api) {
        this.api = api;
      }
      this._initialised = true;
      this._resolveFullyReady();
    });
  }
  ngOnChanges(changes) {
    if (this._initialised) {
      this._angularFrameworkOverrides.runOutsideAngular(() => {
        const gridOptions = {};
        for (const key of Object.keys(changes)) {
          const value = changes[key];
          gridOptions[key] = value.currentValue;
        }
        _processOnChange(gridOptions, this.api);
      });
    }
  }
  ngOnDestroy() {
    if (this._initialised) {
      this._destroyed = true;
      this.api?.destroy();
    }
  }
  // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
  // or via gridOptions
  isEmitterUsed(eventType) {
    const emitter = this[eventType];
    const emitterAny = emitter;
    const hasEmitter = emitterAny?.observed ?? emitterAny?.observers?.length > 0;
    const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`;
    const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];
    return hasEmitter || hasGridOptionListener;
  }
  globalListener(eventType, event) {
    if (this._destroyed) {
      return;
    }
    const emitter = this[eventType];
    if (emitter && this.isEmitterUsed(eventType)) {
      const fireEmitter = () => this._angularFrameworkOverrides.runInsideAngular(() => emitter.emit(event));
      if (this._holdEvents) {
        this._fullyReady.then(() => fireEmitter());
      } else {
        fireEmitter();
      }
    }
  }
  static {
    this.ɵfac = function AgGridAngular_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AgGridAngular)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ViewContainerRef), ɵɵdirectiveInject(AngularFrameworkOverrides), ɵɵdirectiveInject(AngularFrameworkComponentWrapper));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _AgGridAngular,
      selectors: [["ag-grid-angular"]],
      inputs: {
        gridOptions: "gridOptions",
        modules: "modules",
        statusBar: "statusBar",
        sideBar: "sideBar",
        suppressContextMenu: [2, "suppressContextMenu", "suppressContextMenu", booleanAttribute],
        preventDefaultOnContextMenu: [2, "preventDefaultOnContextMenu", "preventDefaultOnContextMenu", booleanAttribute],
        allowContextMenuWithControlKey: [2, "allowContextMenuWithControlKey", "allowContextMenuWithControlKey", booleanAttribute],
        columnMenu: "columnMenu",
        suppressMenuHide: [2, "suppressMenuHide", "suppressMenuHide", booleanAttribute],
        enableBrowserTooltips: [2, "enableBrowserTooltips", "enableBrowserTooltips", booleanAttribute],
        tooltipTrigger: "tooltipTrigger",
        tooltipShowDelay: "tooltipShowDelay",
        tooltipHideDelay: "tooltipHideDelay",
        tooltipMouseTrack: [2, "tooltipMouseTrack", "tooltipMouseTrack", booleanAttribute],
        tooltipShowMode: "tooltipShowMode",
        tooltipInteraction: [2, "tooltipInteraction", "tooltipInteraction", booleanAttribute],
        popupParent: "popupParent",
        copyHeadersToClipboard: [2, "copyHeadersToClipboard", "copyHeadersToClipboard", booleanAttribute],
        copyGroupHeadersToClipboard: [2, "copyGroupHeadersToClipboard", "copyGroupHeadersToClipboard", booleanAttribute],
        clipboardDelimiter: "clipboardDelimiter",
        suppressCopyRowsToClipboard: [2, "suppressCopyRowsToClipboard", "suppressCopyRowsToClipboard", booleanAttribute],
        suppressCopySingleCellRanges: [2, "suppressCopySingleCellRanges", "suppressCopySingleCellRanges", booleanAttribute],
        suppressLastEmptyLineOnPaste: [2, "suppressLastEmptyLineOnPaste", "suppressLastEmptyLineOnPaste", booleanAttribute],
        suppressClipboardPaste: [2, "suppressClipboardPaste", "suppressClipboardPaste", booleanAttribute],
        suppressClipboardApi: [2, "suppressClipboardApi", "suppressClipboardApi", booleanAttribute],
        suppressCutToClipboard: [2, "suppressCutToClipboard", "suppressCutToClipboard", booleanAttribute],
        columnDefs: "columnDefs",
        defaultColDef: "defaultColDef",
        defaultColGroupDef: "defaultColGroupDef",
        columnTypes: "columnTypes",
        dataTypeDefinitions: "dataTypeDefinitions",
        maintainColumnOrder: [2, "maintainColumnOrder", "maintainColumnOrder", booleanAttribute],
        enableStrictPivotColumnOrder: [2, "enableStrictPivotColumnOrder", "enableStrictPivotColumnOrder", booleanAttribute],
        suppressFieldDotNotation: [2, "suppressFieldDotNotation", "suppressFieldDotNotation", booleanAttribute],
        headerHeight: "headerHeight",
        groupHeaderHeight: "groupHeaderHeight",
        floatingFiltersHeight: "floatingFiltersHeight",
        pivotHeaderHeight: "pivotHeaderHeight",
        pivotGroupHeaderHeight: "pivotGroupHeaderHeight",
        allowDragFromColumnsToolPanel: [2, "allowDragFromColumnsToolPanel", "allowDragFromColumnsToolPanel", booleanAttribute],
        suppressMovableColumns: [2, "suppressMovableColumns", "suppressMovableColumns", booleanAttribute],
        suppressColumnMoveAnimation: [2, "suppressColumnMoveAnimation", "suppressColumnMoveAnimation", booleanAttribute],
        suppressMoveWhenColumnDragging: [2, "suppressMoveWhenColumnDragging", "suppressMoveWhenColumnDragging", booleanAttribute],
        suppressDragLeaveHidesColumns: [2, "suppressDragLeaveHidesColumns", "suppressDragLeaveHidesColumns", booleanAttribute],
        suppressGroupChangesColumnVisibility: "suppressGroupChangesColumnVisibility",
        suppressMakeColumnVisibleAfterUnGroup: [2, "suppressMakeColumnVisibleAfterUnGroup", "suppressMakeColumnVisibleAfterUnGroup", booleanAttribute],
        suppressRowGroupHidesColumns: [2, "suppressRowGroupHidesColumns", "suppressRowGroupHidesColumns", booleanAttribute],
        colResizeDefault: "colResizeDefault",
        suppressAutoSize: [2, "suppressAutoSize", "suppressAutoSize", booleanAttribute],
        autoSizePadding: "autoSizePadding",
        skipHeaderOnAutoSize: [2, "skipHeaderOnAutoSize", "skipHeaderOnAutoSize", booleanAttribute],
        autoSizeStrategy: "autoSizeStrategy",
        components: "components",
        editType: "editType",
        singleClickEdit: [2, "singleClickEdit", "singleClickEdit", booleanAttribute],
        suppressClickEdit: [2, "suppressClickEdit", "suppressClickEdit", booleanAttribute],
        readOnlyEdit: [2, "readOnlyEdit", "readOnlyEdit", booleanAttribute],
        stopEditingWhenCellsLoseFocus: [2, "stopEditingWhenCellsLoseFocus", "stopEditingWhenCellsLoseFocus", booleanAttribute],
        enterNavigatesVertically: [2, "enterNavigatesVertically", "enterNavigatesVertically", booleanAttribute],
        enterNavigatesVerticallyAfterEdit: [2, "enterNavigatesVerticallyAfterEdit", "enterNavigatesVerticallyAfterEdit", booleanAttribute],
        enableCellEditingOnBackspace: [2, "enableCellEditingOnBackspace", "enableCellEditingOnBackspace", booleanAttribute],
        undoRedoCellEditing: [2, "undoRedoCellEditing", "undoRedoCellEditing", booleanAttribute],
        undoRedoCellEditingLimit: "undoRedoCellEditingLimit",
        defaultCsvExportParams: "defaultCsvExportParams",
        suppressCsvExport: [2, "suppressCsvExport", "suppressCsvExport", booleanAttribute],
        defaultExcelExportParams: "defaultExcelExportParams",
        suppressExcelExport: [2, "suppressExcelExport", "suppressExcelExport", booleanAttribute],
        excelStyles: "excelStyles",
        findSearchValue: "findSearchValue",
        findOptions: "findOptions",
        quickFilterText: "quickFilterText",
        cacheQuickFilter: [2, "cacheQuickFilter", "cacheQuickFilter", booleanAttribute],
        includeHiddenColumnsInQuickFilter: [2, "includeHiddenColumnsInQuickFilter", "includeHiddenColumnsInQuickFilter", booleanAttribute],
        quickFilterParser: "quickFilterParser",
        quickFilterMatcher: "quickFilterMatcher",
        applyQuickFilterBeforePivotOrAgg: [2, "applyQuickFilterBeforePivotOrAgg", "applyQuickFilterBeforePivotOrAgg", booleanAttribute],
        excludeChildrenWhenTreeDataFiltering: [2, "excludeChildrenWhenTreeDataFiltering", "excludeChildrenWhenTreeDataFiltering", booleanAttribute],
        enableAdvancedFilter: [2, "enableAdvancedFilter", "enableAdvancedFilter", booleanAttribute],
        alwaysPassFilter: "alwaysPassFilter",
        includeHiddenColumnsInAdvancedFilter: [2, "includeHiddenColumnsInAdvancedFilter", "includeHiddenColumnsInAdvancedFilter", booleanAttribute],
        advancedFilterParent: "advancedFilterParent",
        advancedFilterBuilderParams: "advancedFilterBuilderParams",
        suppressAdvancedFilterEval: [2, "suppressAdvancedFilterEval", "suppressAdvancedFilterEval", booleanAttribute],
        suppressSetFilterByDefault: [2, "suppressSetFilterByDefault", "suppressSetFilterByDefault", booleanAttribute],
        enableCharts: [2, "enableCharts", "enableCharts", booleanAttribute],
        chartThemes: "chartThemes",
        customChartThemes: "customChartThemes",
        chartThemeOverrides: "chartThemeOverrides",
        chartToolPanelsDef: "chartToolPanelsDef",
        chartMenuItems: "chartMenuItems",
        loadingCellRenderer: "loadingCellRenderer",
        loadingCellRendererParams: "loadingCellRendererParams",
        loadingCellRendererSelector: "loadingCellRendererSelector",
        localeText: "localeText",
        masterDetail: [2, "masterDetail", "masterDetail", booleanAttribute],
        keepDetailRows: [2, "keepDetailRows", "keepDetailRows", booleanAttribute],
        keepDetailRowsCount: "keepDetailRowsCount",
        detailCellRenderer: "detailCellRenderer",
        detailCellRendererParams: "detailCellRendererParams",
        detailRowHeight: "detailRowHeight",
        detailRowAutoHeight: [2, "detailRowAutoHeight", "detailRowAutoHeight", booleanAttribute],
        context: "context",
        alignedGrids: "alignedGrids",
        tabIndex: "tabIndex",
        rowBuffer: "rowBuffer",
        valueCache: [2, "valueCache", "valueCache", booleanAttribute],
        valueCacheNeverExpires: [2, "valueCacheNeverExpires", "valueCacheNeverExpires", booleanAttribute],
        enableCellExpressions: [2, "enableCellExpressions", "enableCellExpressions", booleanAttribute],
        suppressTouch: [2, "suppressTouch", "suppressTouch", booleanAttribute],
        suppressFocusAfterRefresh: [2, "suppressFocusAfterRefresh", "suppressFocusAfterRefresh", booleanAttribute],
        suppressBrowserResizeObserver: [2, "suppressBrowserResizeObserver", "suppressBrowserResizeObserver", booleanAttribute],
        suppressPropertyNamesCheck: [2, "suppressPropertyNamesCheck", "suppressPropertyNamesCheck", booleanAttribute],
        suppressChangeDetection: [2, "suppressChangeDetection", "suppressChangeDetection", booleanAttribute],
        debug: [2, "debug", "debug", booleanAttribute],
        loading: [2, "loading", "loading", booleanAttribute],
        overlayLoadingTemplate: "overlayLoadingTemplate",
        loadingOverlayComponent: "loadingOverlayComponent",
        loadingOverlayComponentParams: "loadingOverlayComponentParams",
        suppressLoadingOverlay: [2, "suppressLoadingOverlay", "suppressLoadingOverlay", booleanAttribute],
        overlayNoRowsTemplate: "overlayNoRowsTemplate",
        noRowsOverlayComponent: "noRowsOverlayComponent",
        noRowsOverlayComponentParams: "noRowsOverlayComponentParams",
        suppressNoRowsOverlay: [2, "suppressNoRowsOverlay", "suppressNoRowsOverlay", booleanAttribute],
        pagination: [2, "pagination", "pagination", booleanAttribute],
        paginationPageSize: "paginationPageSize",
        paginationPageSizeSelector: "paginationPageSizeSelector",
        paginationAutoPageSize: [2, "paginationAutoPageSize", "paginationAutoPageSize", booleanAttribute],
        paginateChildRows: [2, "paginateChildRows", "paginateChildRows", booleanAttribute],
        suppressPaginationPanel: [2, "suppressPaginationPanel", "suppressPaginationPanel", booleanAttribute],
        pivotMode: [2, "pivotMode", "pivotMode", booleanAttribute],
        pivotPanelShow: "pivotPanelShow",
        pivotMaxGeneratedColumns: "pivotMaxGeneratedColumns",
        pivotDefaultExpanded: "pivotDefaultExpanded",
        pivotColumnGroupTotals: "pivotColumnGroupTotals",
        pivotRowTotals: "pivotRowTotals",
        pivotSuppressAutoColumn: [2, "pivotSuppressAutoColumn", "pivotSuppressAutoColumn", booleanAttribute],
        suppressExpandablePivotGroups: [2, "suppressExpandablePivotGroups", "suppressExpandablePivotGroups", booleanAttribute],
        functionsReadOnly: [2, "functionsReadOnly", "functionsReadOnly", booleanAttribute],
        aggFuncs: "aggFuncs",
        suppressAggFuncInHeader: [2, "suppressAggFuncInHeader", "suppressAggFuncInHeader", booleanAttribute],
        alwaysAggregateAtRootLevel: [2, "alwaysAggregateAtRootLevel", "alwaysAggregateAtRootLevel", booleanAttribute],
        aggregateOnlyChangedColumns: [2, "aggregateOnlyChangedColumns", "aggregateOnlyChangedColumns", booleanAttribute],
        suppressAggFilteredOnly: [2, "suppressAggFilteredOnly", "suppressAggFilteredOnly", booleanAttribute],
        removePivotHeaderRowWhenSingleValueColumn: [2, "removePivotHeaderRowWhenSingleValueColumn", "removePivotHeaderRowWhenSingleValueColumn", booleanAttribute],
        animateRows: [2, "animateRows", "animateRows", booleanAttribute],
        cellFlashDuration: "cellFlashDuration",
        cellFadeDuration: "cellFadeDuration",
        allowShowChangeAfterFilter: [2, "allowShowChangeAfterFilter", "allowShowChangeAfterFilter", booleanAttribute],
        domLayout: "domLayout",
        ensureDomOrder: [2, "ensureDomOrder", "ensureDomOrder", booleanAttribute],
        enableCellSpan: [2, "enableCellSpan", "enableCellSpan", booleanAttribute],
        enableRtl: [2, "enableRtl", "enableRtl", booleanAttribute],
        suppressColumnVirtualisation: [2, "suppressColumnVirtualisation", "suppressColumnVirtualisation", booleanAttribute],
        suppressMaxRenderedRowRestriction: [2, "suppressMaxRenderedRowRestriction", "suppressMaxRenderedRowRestriction", booleanAttribute],
        suppressRowVirtualisation: [2, "suppressRowVirtualisation", "suppressRowVirtualisation", booleanAttribute],
        rowDragManaged: [2, "rowDragManaged", "rowDragManaged", booleanAttribute],
        suppressRowDrag: [2, "suppressRowDrag", "suppressRowDrag", booleanAttribute],
        suppressMoveWhenRowDragging: [2, "suppressMoveWhenRowDragging", "suppressMoveWhenRowDragging", booleanAttribute],
        rowDragEntireRow: [2, "rowDragEntireRow", "rowDragEntireRow", booleanAttribute],
        rowDragMultiRow: [2, "rowDragMultiRow", "rowDragMultiRow", booleanAttribute],
        rowDragText: "rowDragText",
        dragAndDropImageComponent: "dragAndDropImageComponent",
        dragAndDropImageComponentParams: "dragAndDropImageComponentParams",
        fullWidthCellRenderer: "fullWidthCellRenderer",
        fullWidthCellRendererParams: "fullWidthCellRendererParams",
        embedFullWidthRows: [2, "embedFullWidthRows", "embedFullWidthRows", booleanAttribute],
        groupDisplayType: "groupDisplayType",
        groupDefaultExpanded: "groupDefaultExpanded",
        autoGroupColumnDef: "autoGroupColumnDef",
        groupMaintainOrder: [2, "groupMaintainOrder", "groupMaintainOrder", booleanAttribute],
        groupSelectsChildren: [2, "groupSelectsChildren", "groupSelectsChildren", booleanAttribute],
        groupLockGroupColumns: "groupLockGroupColumns",
        groupAggFiltering: "groupAggFiltering",
        groupTotalRow: "groupTotalRow",
        grandTotalRow: "grandTotalRow",
        suppressStickyTotalRow: "suppressStickyTotalRow",
        groupSuppressBlankHeader: [2, "groupSuppressBlankHeader", "groupSuppressBlankHeader", booleanAttribute],
        groupSelectsFiltered: [2, "groupSelectsFiltered", "groupSelectsFiltered", booleanAttribute],
        showOpenedGroup: [2, "showOpenedGroup", "showOpenedGroup", booleanAttribute],
        groupHideParentOfSingleChild: "groupHideParentOfSingleChild",
        groupRemoveSingleChildren: [2, "groupRemoveSingleChildren", "groupRemoveSingleChildren", booleanAttribute],
        groupRemoveLowestSingleChildren: [2, "groupRemoveLowestSingleChildren", "groupRemoveLowestSingleChildren", booleanAttribute],
        groupHideOpenParents: [2, "groupHideOpenParents", "groupHideOpenParents", booleanAttribute],
        groupAllowUnbalanced: [2, "groupAllowUnbalanced", "groupAllowUnbalanced", booleanAttribute],
        rowGroupPanelShow: "rowGroupPanelShow",
        groupRowRenderer: "groupRowRenderer",
        groupRowRendererParams: "groupRowRendererParams",
        treeData: [2, "treeData", "treeData", booleanAttribute],
        treeDataChildrenField: "treeDataChildrenField",
        treeDataParentIdField: "treeDataParentIdField",
        rowGroupPanelSuppressSort: [2, "rowGroupPanelSuppressSort", "rowGroupPanelSuppressSort", booleanAttribute],
        suppressGroupRowsSticky: [2, "suppressGroupRowsSticky", "suppressGroupRowsSticky", booleanAttribute],
        pinnedTopRowData: "pinnedTopRowData",
        pinnedBottomRowData: "pinnedBottomRowData",
        enableRowPinning: "enableRowPinning",
        isRowPinnable: "isRowPinnable",
        isRowPinned: "isRowPinned",
        rowModelType: "rowModelType",
        rowData: "rowData",
        asyncTransactionWaitMillis: "asyncTransactionWaitMillis",
        suppressModelUpdateAfterUpdateTransaction: [2, "suppressModelUpdateAfterUpdateTransaction", "suppressModelUpdateAfterUpdateTransaction", booleanAttribute],
        datasource: "datasource",
        cacheOverflowSize: "cacheOverflowSize",
        infiniteInitialRowCount: "infiniteInitialRowCount",
        serverSideInitialRowCount: "serverSideInitialRowCount",
        suppressServerSideFullWidthLoadingRow: [2, "suppressServerSideFullWidthLoadingRow", "suppressServerSideFullWidthLoadingRow", booleanAttribute],
        cacheBlockSize: "cacheBlockSize",
        maxBlocksInCache: "maxBlocksInCache",
        maxConcurrentDatasourceRequests: "maxConcurrentDatasourceRequests",
        blockLoadDebounceMillis: "blockLoadDebounceMillis",
        purgeClosedRowNodes: [2, "purgeClosedRowNodes", "purgeClosedRowNodes", booleanAttribute],
        serverSideDatasource: "serverSideDatasource",
        serverSideSortAllLevels: [2, "serverSideSortAllLevels", "serverSideSortAllLevels", booleanAttribute],
        serverSideEnableClientSideSort: [2, "serverSideEnableClientSideSort", "serverSideEnableClientSideSort", booleanAttribute],
        serverSideOnlyRefreshFilteredGroups: [2, "serverSideOnlyRefreshFilteredGroups", "serverSideOnlyRefreshFilteredGroups", booleanAttribute],
        serverSidePivotResultFieldSeparator: "serverSidePivotResultFieldSeparator",
        viewportDatasource: "viewportDatasource",
        viewportRowModelPageSize: "viewportRowModelPageSize",
        viewportRowModelBufferSize: "viewportRowModelBufferSize",
        alwaysShowHorizontalScroll: [2, "alwaysShowHorizontalScroll", "alwaysShowHorizontalScroll", booleanAttribute],
        alwaysShowVerticalScroll: [2, "alwaysShowVerticalScroll", "alwaysShowVerticalScroll", booleanAttribute],
        debounceVerticalScrollbar: [2, "debounceVerticalScrollbar", "debounceVerticalScrollbar", booleanAttribute],
        suppressHorizontalScroll: [2, "suppressHorizontalScroll", "suppressHorizontalScroll", booleanAttribute],
        suppressScrollOnNewData: [2, "suppressScrollOnNewData", "suppressScrollOnNewData", booleanAttribute],
        suppressScrollWhenPopupsAreOpen: [2, "suppressScrollWhenPopupsAreOpen", "suppressScrollWhenPopupsAreOpen", booleanAttribute],
        suppressAnimationFrame: [2, "suppressAnimationFrame", "suppressAnimationFrame", booleanAttribute],
        suppressMiddleClickScrolls: [2, "suppressMiddleClickScrolls", "suppressMiddleClickScrolls", booleanAttribute],
        suppressPreventDefaultOnMouseWheel: [2, "suppressPreventDefaultOnMouseWheel", "suppressPreventDefaultOnMouseWheel", booleanAttribute],
        scrollbarWidth: "scrollbarWidth",
        rowSelection: "rowSelection",
        cellSelection: "cellSelection",
        rowMultiSelectWithClick: [2, "rowMultiSelectWithClick", "rowMultiSelectWithClick", booleanAttribute],
        suppressRowDeselection: [2, "suppressRowDeselection", "suppressRowDeselection", booleanAttribute],
        suppressRowClickSelection: [2, "suppressRowClickSelection", "suppressRowClickSelection", booleanAttribute],
        suppressCellFocus: [2, "suppressCellFocus", "suppressCellFocus", booleanAttribute],
        suppressHeaderFocus: [2, "suppressHeaderFocus", "suppressHeaderFocus", booleanAttribute],
        selectionColumnDef: "selectionColumnDef",
        rowNumbers: "rowNumbers",
        suppressMultiRangeSelection: [2, "suppressMultiRangeSelection", "suppressMultiRangeSelection", booleanAttribute],
        enableCellTextSelection: [2, "enableCellTextSelection", "enableCellTextSelection", booleanAttribute],
        enableRangeSelection: [2, "enableRangeSelection", "enableRangeSelection", booleanAttribute],
        enableRangeHandle: [2, "enableRangeHandle", "enableRangeHandle", booleanAttribute],
        enableFillHandle: [2, "enableFillHandle", "enableFillHandle", booleanAttribute],
        fillHandleDirection: "fillHandleDirection",
        suppressClearOnFillReduction: [2, "suppressClearOnFillReduction", "suppressClearOnFillReduction", booleanAttribute],
        sortingOrder: "sortingOrder",
        accentedSort: [2, "accentedSort", "accentedSort", booleanAttribute],
        unSortIcon: [2, "unSortIcon", "unSortIcon", booleanAttribute],
        suppressMultiSort: [2, "suppressMultiSort", "suppressMultiSort", booleanAttribute],
        alwaysMultiSort: [2, "alwaysMultiSort", "alwaysMultiSort", booleanAttribute],
        multiSortKey: "multiSortKey",
        suppressMaintainUnsortedOrder: [2, "suppressMaintainUnsortedOrder", "suppressMaintainUnsortedOrder", booleanAttribute],
        icons: "icons",
        rowHeight: "rowHeight",
        rowStyle: "rowStyle",
        rowClass: "rowClass",
        rowClassRules: "rowClassRules",
        suppressRowHoverHighlight: [2, "suppressRowHoverHighlight", "suppressRowHoverHighlight", booleanAttribute],
        suppressRowTransform: [2, "suppressRowTransform", "suppressRowTransform", booleanAttribute],
        columnHoverHighlight: [2, "columnHoverHighlight", "columnHoverHighlight", booleanAttribute],
        gridId: "gridId",
        deltaSort: [2, "deltaSort", "deltaSort", booleanAttribute],
        treeDataDisplayType: "treeDataDisplayType",
        enableGroupEdit: [2, "enableGroupEdit", "enableGroupEdit", booleanAttribute],
        initialState: "initialState",
        theme: "theme",
        loadThemeGoogleFonts: [2, "loadThemeGoogleFonts", "loadThemeGoogleFonts", booleanAttribute],
        themeCssLayer: "themeCssLayer",
        styleNonce: "styleNonce",
        themeStyleContainer: "themeStyleContainer",
        getContextMenuItems: "getContextMenuItems",
        getMainMenuItems: "getMainMenuItems",
        postProcessPopup: "postProcessPopup",
        processUnpinnedColumns: "processUnpinnedColumns",
        processCellForClipboard: "processCellForClipboard",
        processHeaderForClipboard: "processHeaderForClipboard",
        processGroupHeaderForClipboard: "processGroupHeaderForClipboard",
        processCellFromClipboard: "processCellFromClipboard",
        sendToClipboard: "sendToClipboard",
        processDataFromClipboard: "processDataFromClipboard",
        isExternalFilterPresent: "isExternalFilterPresent",
        doesExternalFilterPass: "doesExternalFilterPass",
        getChartToolbarItems: "getChartToolbarItems",
        createChartContainer: "createChartContainer",
        focusGridInnerElement: "focusGridInnerElement",
        navigateToNextHeader: "navigateToNextHeader",
        tabToNextHeader: "tabToNextHeader",
        navigateToNextCell: "navigateToNextCell",
        tabToNextCell: "tabToNextCell",
        getLocaleText: "getLocaleText",
        getDocument: "getDocument",
        paginationNumberFormatter: "paginationNumberFormatter",
        getGroupRowAgg: "getGroupRowAgg",
        isGroupOpenByDefault: "isGroupOpenByDefault",
        initialGroupOrderComparator: "initialGroupOrderComparator",
        processPivotResultColDef: "processPivotResultColDef",
        processPivotResultColGroupDef: "processPivotResultColGroupDef",
        getDataPath: "getDataPath",
        getChildCount: "getChildCount",
        getServerSideGroupLevelParams: "getServerSideGroupLevelParams",
        isServerSideGroupOpenByDefault: "isServerSideGroupOpenByDefault",
        isApplyServerSideTransaction: "isApplyServerSideTransaction",
        isServerSideGroup: "isServerSideGroup",
        getServerSideGroupKey: "getServerSideGroupKey",
        getBusinessKeyForNode: "getBusinessKeyForNode",
        getRowId: "getRowId",
        resetRowDataOnUpdate: [2, "resetRowDataOnUpdate", "resetRowDataOnUpdate", booleanAttribute],
        processRowPostCreate: "processRowPostCreate",
        isRowSelectable: "isRowSelectable",
        isRowMaster: "isRowMaster",
        fillOperation: "fillOperation",
        postSortRows: "postSortRows",
        getRowStyle: "getRowStyle",
        getRowClass: "getRowClass",
        getRowHeight: "getRowHeight",
        isFullWidthRow: "isFullWidthRow"
      },
      outputs: {
        toolPanelVisibleChanged: "toolPanelVisibleChanged",
        toolPanelSizeChanged: "toolPanelSizeChanged",
        columnMenuVisibleChanged: "columnMenuVisibleChanged",
        contextMenuVisibleChanged: "contextMenuVisibleChanged",
        cutStart: "cutStart",
        cutEnd: "cutEnd",
        pasteStart: "pasteStart",
        pasteEnd: "pasteEnd",
        columnVisible: "columnVisible",
        columnPinned: "columnPinned",
        columnResized: "columnResized",
        columnMoved: "columnMoved",
        columnValueChanged: "columnValueChanged",
        columnPivotModeChanged: "columnPivotModeChanged",
        columnPivotChanged: "columnPivotChanged",
        columnGroupOpened: "columnGroupOpened",
        newColumnsLoaded: "newColumnsLoaded",
        gridColumnsChanged: "gridColumnsChanged",
        displayedColumnsChanged: "displayedColumnsChanged",
        virtualColumnsChanged: "virtualColumnsChanged",
        columnEverythingChanged: "columnEverythingChanged",
        columnHeaderMouseOver: "columnHeaderMouseOver",
        columnHeaderMouseLeave: "columnHeaderMouseLeave",
        columnHeaderClicked: "columnHeaderClicked",
        columnHeaderContextMenu: "columnHeaderContextMenu",
        componentStateChanged: "componentStateChanged",
        cellValueChanged: "cellValueChanged",
        cellEditRequest: "cellEditRequest",
        rowValueChanged: "rowValueChanged",
        cellEditingStarted: "cellEditingStarted",
        cellEditingStopped: "cellEditingStopped",
        rowEditingStarted: "rowEditingStarted",
        rowEditingStopped: "rowEditingStopped",
        undoStarted: "undoStarted",
        undoEnded: "undoEnded",
        redoStarted: "redoStarted",
        redoEnded: "redoEnded",
        cellSelectionDeleteStart: "cellSelectionDeleteStart",
        cellSelectionDeleteEnd: "cellSelectionDeleteEnd",
        rangeDeleteStart: "rangeDeleteStart",
        rangeDeleteEnd: "rangeDeleteEnd",
        fillStart: "fillStart",
        fillEnd: "fillEnd",
        filterOpened: "filterOpened",
        filterChanged: "filterChanged",
        filterModified: "filterModified",
        advancedFilterBuilderVisibleChanged: "advancedFilterBuilderVisibleChanged",
        findChanged: "findChanged",
        chartCreated: "chartCreated",
        chartRangeSelectionChanged: "chartRangeSelectionChanged",
        chartOptionsChanged: "chartOptionsChanged",
        chartDestroyed: "chartDestroyed",
        cellKeyDown: "cellKeyDown",
        gridReady: "gridReady",
        firstDataRendered: "firstDataRendered",
        gridSizeChanged: "gridSizeChanged",
        modelUpdated: "modelUpdated",
        virtualRowRemoved: "virtualRowRemoved",
        viewportChanged: "viewportChanged",
        bodyScroll: "bodyScroll",
        bodyScrollEnd: "bodyScrollEnd",
        dragStarted: "dragStarted",
        dragStopped: "dragStopped",
        dragCancelled: "dragCancelled",
        stateUpdated: "stateUpdated",
        paginationChanged: "paginationChanged",
        rowDragEnter: "rowDragEnter",
        rowDragMove: "rowDragMove",
        rowDragLeave: "rowDragLeave",
        rowDragEnd: "rowDragEnd",
        rowDragCancel: "rowDragCancel",
        rowResizeStarted: "rowResizeStarted",
        rowResizeEnded: "rowResizeEnded",
        columnRowGroupChanged: "columnRowGroupChanged",
        rowGroupOpened: "rowGroupOpened",
        expandOrCollapseAll: "expandOrCollapseAll",
        pivotMaxColumnsExceeded: "pivotMaxColumnsExceeded",
        pinnedRowDataChanged: "pinnedRowDataChanged",
        pinnedRowsChanged: "pinnedRowsChanged",
        rowDataUpdated: "rowDataUpdated",
        asyncTransactionsFlushed: "asyncTransactionsFlushed",
        storeRefreshed: "storeRefreshed",
        headerFocused: "headerFocused",
        cellClicked: "cellClicked",
        cellDoubleClicked: "cellDoubleClicked",
        cellFocused: "cellFocused",
        cellMouseOver: "cellMouseOver",
        cellMouseOut: "cellMouseOut",
        cellMouseDown: "cellMouseDown",
        rowClicked: "rowClicked",
        rowDoubleClicked: "rowDoubleClicked",
        rowSelected: "rowSelected",
        selectionChanged: "selectionChanged",
        cellContextMenu: "cellContextMenu",
        rangeSelectionChanged: "rangeSelectionChanged",
        cellSelectionChanged: "cellSelectionChanged",
        tooltipShow: "tooltipShow",
        tooltipHide: "tooltipHide",
        sortChanged: "sortChanged"
      },
      features: [ɵɵProvidersFeature([AngularFrameworkOverrides, AngularFrameworkComponentWrapper]), ɵɵNgOnChangesFeature],
      decls: 0,
      vars: 0,
      template: function AgGridAngular_Template(rf, ctx) {
      },
      encapsulation: 2
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AgGridAngular, [{
    type: Component,
    args: [{
      selector: "ag-grid-angular",
      standalone: true,
      template: "",
      providers: [AngularFrameworkOverrides, AngularFrameworkComponentWrapper],
      // tell angular we don't want view encapsulation, we don't want a shadow root
      encapsulation: ViewEncapsulation.None
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: ViewContainerRef
  }, {
    type: AngularFrameworkOverrides
  }, {
    type: AngularFrameworkComponentWrapper
  }], {
    gridOptions: [{
      type: Input
    }],
    modules: [{
      type: Input
    }],
    statusBar: [{
      type: Input
    }],
    sideBar: [{
      type: Input
    }],
    suppressContextMenu: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    preventDefaultOnContextMenu: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    allowContextMenuWithControlKey: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    columnMenu: [{
      type: Input
    }],
    suppressMenuHide: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableBrowserTooltips: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    tooltipTrigger: [{
      type: Input
    }],
    tooltipShowDelay: [{
      type: Input
    }],
    tooltipHideDelay: [{
      type: Input
    }],
    tooltipMouseTrack: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    tooltipShowMode: [{
      type: Input
    }],
    tooltipInteraction: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    popupParent: [{
      type: Input
    }],
    copyHeadersToClipboard: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    copyGroupHeadersToClipboard: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    clipboardDelimiter: [{
      type: Input
    }],
    suppressCopyRowsToClipboard: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressCopySingleCellRanges: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressLastEmptyLineOnPaste: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressClipboardPaste: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressClipboardApi: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressCutToClipboard: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    columnDefs: [{
      type: Input
    }],
    defaultColDef: [{
      type: Input
    }],
    defaultColGroupDef: [{
      type: Input
    }],
    columnTypes: [{
      type: Input
    }],
    dataTypeDefinitions: [{
      type: Input
    }],
    maintainColumnOrder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableStrictPivotColumnOrder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressFieldDotNotation: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    headerHeight: [{
      type: Input
    }],
    groupHeaderHeight: [{
      type: Input
    }],
    floatingFiltersHeight: [{
      type: Input
    }],
    pivotHeaderHeight: [{
      type: Input
    }],
    pivotGroupHeaderHeight: [{
      type: Input
    }],
    allowDragFromColumnsToolPanel: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMovableColumns: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressColumnMoveAnimation: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMoveWhenColumnDragging: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressDragLeaveHidesColumns: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressGroupChangesColumnVisibility: [{
      type: Input
    }],
    suppressMakeColumnVisibleAfterUnGroup: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowGroupHidesColumns: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    colResizeDefault: [{
      type: Input
    }],
    suppressAutoSize: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    autoSizePadding: [{
      type: Input
    }],
    skipHeaderOnAutoSize: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    autoSizeStrategy: [{
      type: Input
    }],
    components: [{
      type: Input
    }],
    editType: [{
      type: Input
    }],
    singleClickEdit: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressClickEdit: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    readOnlyEdit: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    stopEditingWhenCellsLoseFocus: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enterNavigatesVertically: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enterNavigatesVerticallyAfterEdit: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableCellEditingOnBackspace: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    undoRedoCellEditing: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    undoRedoCellEditingLimit: [{
      type: Input
    }],
    defaultCsvExportParams: [{
      type: Input
    }],
    suppressCsvExport: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    defaultExcelExportParams: [{
      type: Input
    }],
    suppressExcelExport: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    excelStyles: [{
      type: Input
    }],
    findSearchValue: [{
      type: Input
    }],
    findOptions: [{
      type: Input
    }],
    quickFilterText: [{
      type: Input
    }],
    cacheQuickFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    includeHiddenColumnsInQuickFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    quickFilterParser: [{
      type: Input
    }],
    quickFilterMatcher: [{
      type: Input
    }],
    applyQuickFilterBeforePivotOrAgg: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    excludeChildrenWhenTreeDataFiltering: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableAdvancedFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    alwaysPassFilter: [{
      type: Input
    }],
    includeHiddenColumnsInAdvancedFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    advancedFilterParent: [{
      type: Input
    }],
    advancedFilterBuilderParams: [{
      type: Input
    }],
    suppressAdvancedFilterEval: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressSetFilterByDefault: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableCharts: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    chartThemes: [{
      type: Input
    }],
    customChartThemes: [{
      type: Input
    }],
    chartThemeOverrides: [{
      type: Input
    }],
    chartToolPanelsDef: [{
      type: Input
    }],
    chartMenuItems: [{
      type: Input
    }],
    loadingCellRenderer: [{
      type: Input
    }],
    loadingCellRendererParams: [{
      type: Input
    }],
    loadingCellRendererSelector: [{
      type: Input
    }],
    localeText: [{
      type: Input
    }],
    masterDetail: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    keepDetailRows: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    keepDetailRowsCount: [{
      type: Input
    }],
    detailCellRenderer: [{
      type: Input
    }],
    detailCellRendererParams: [{
      type: Input
    }],
    detailRowHeight: [{
      type: Input
    }],
    detailRowAutoHeight: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    context: [{
      type: Input
    }],
    alignedGrids: [{
      type: Input
    }],
    tabIndex: [{
      type: Input
    }],
    rowBuffer: [{
      type: Input
    }],
    valueCache: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    valueCacheNeverExpires: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableCellExpressions: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressTouch: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressFocusAfterRefresh: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressBrowserResizeObserver: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressPropertyNamesCheck: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressChangeDetection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    debug: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    loading: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    overlayLoadingTemplate: [{
      type: Input
    }],
    loadingOverlayComponent: [{
      type: Input
    }],
    loadingOverlayComponentParams: [{
      type: Input
    }],
    suppressLoadingOverlay: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    overlayNoRowsTemplate: [{
      type: Input
    }],
    noRowsOverlayComponent: [{
      type: Input
    }],
    noRowsOverlayComponentParams: [{
      type: Input
    }],
    suppressNoRowsOverlay: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    pagination: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    paginationPageSize: [{
      type: Input
    }],
    paginationPageSizeSelector: [{
      type: Input
    }],
    paginationAutoPageSize: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    paginateChildRows: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressPaginationPanel: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    pivotMode: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    pivotPanelShow: [{
      type: Input
    }],
    pivotMaxGeneratedColumns: [{
      type: Input
    }],
    pivotDefaultExpanded: [{
      type: Input
    }],
    pivotColumnGroupTotals: [{
      type: Input
    }],
    pivotRowTotals: [{
      type: Input
    }],
    pivotSuppressAutoColumn: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressExpandablePivotGroups: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    functionsReadOnly: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    aggFuncs: [{
      type: Input
    }],
    suppressAggFuncInHeader: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    alwaysAggregateAtRootLevel: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    aggregateOnlyChangedColumns: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressAggFilteredOnly: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    removePivotHeaderRowWhenSingleValueColumn: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    animateRows: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    cellFlashDuration: [{
      type: Input
    }],
    cellFadeDuration: [{
      type: Input
    }],
    allowShowChangeAfterFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    domLayout: [{
      type: Input
    }],
    ensureDomOrder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableCellSpan: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableRtl: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressColumnVirtualisation: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMaxRenderedRowRestriction: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowVirtualisation: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rowDragManaged: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowDrag: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMoveWhenRowDragging: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rowDragEntireRow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rowDragMultiRow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rowDragText: [{
      type: Input
    }],
    dragAndDropImageComponent: [{
      type: Input
    }],
    dragAndDropImageComponentParams: [{
      type: Input
    }],
    fullWidthCellRenderer: [{
      type: Input
    }],
    fullWidthCellRendererParams: [{
      type: Input
    }],
    embedFullWidthRows: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupDisplayType: [{
      type: Input
    }],
    groupDefaultExpanded: [{
      type: Input
    }],
    autoGroupColumnDef: [{
      type: Input
    }],
    groupMaintainOrder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupSelectsChildren: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupLockGroupColumns: [{
      type: Input
    }],
    groupAggFiltering: [{
      type: Input
    }],
    groupTotalRow: [{
      type: Input
    }],
    grandTotalRow: [{
      type: Input
    }],
    suppressStickyTotalRow: [{
      type: Input
    }],
    groupSuppressBlankHeader: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupSelectsFiltered: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    showOpenedGroup: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupHideParentOfSingleChild: [{
      type: Input
    }],
    groupRemoveSingleChildren: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupRemoveLowestSingleChildren: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupHideOpenParents: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    groupAllowUnbalanced: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    rowGroupPanelShow: [{
      type: Input
    }],
    groupRowRenderer: [{
      type: Input
    }],
    groupRowRendererParams: [{
      type: Input
    }],
    treeData: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    treeDataChildrenField: [{
      type: Input
    }],
    treeDataParentIdField: [{
      type: Input
    }],
    rowGroupPanelSuppressSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressGroupRowsSticky: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    pinnedTopRowData: [{
      type: Input
    }],
    pinnedBottomRowData: [{
      type: Input
    }],
    enableRowPinning: [{
      type: Input
    }],
    isRowPinnable: [{
      type: Input
    }],
    isRowPinned: [{
      type: Input
    }],
    rowModelType: [{
      type: Input
    }],
    rowData: [{
      type: Input
    }],
    asyncTransactionWaitMillis: [{
      type: Input
    }],
    suppressModelUpdateAfterUpdateTransaction: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    datasource: [{
      type: Input
    }],
    cacheOverflowSize: [{
      type: Input
    }],
    infiniteInitialRowCount: [{
      type: Input
    }],
    serverSideInitialRowCount: [{
      type: Input
    }],
    suppressServerSideFullWidthLoadingRow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    cacheBlockSize: [{
      type: Input
    }],
    maxBlocksInCache: [{
      type: Input
    }],
    maxConcurrentDatasourceRequests: [{
      type: Input
    }],
    blockLoadDebounceMillis: [{
      type: Input
    }],
    purgeClosedRowNodes: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    serverSideDatasource: [{
      type: Input
    }],
    serverSideSortAllLevels: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    serverSideEnableClientSideSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    serverSideOnlyRefreshFilteredGroups: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    serverSidePivotResultFieldSeparator: [{
      type: Input
    }],
    viewportDatasource: [{
      type: Input
    }],
    viewportRowModelPageSize: [{
      type: Input
    }],
    viewportRowModelBufferSize: [{
      type: Input
    }],
    alwaysShowHorizontalScroll: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    alwaysShowVerticalScroll: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    debounceVerticalScrollbar: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressHorizontalScroll: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressScrollOnNewData: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressScrollWhenPopupsAreOpen: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressAnimationFrame: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMiddleClickScrolls: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressPreventDefaultOnMouseWheel: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    scrollbarWidth: [{
      type: Input
    }],
    rowSelection: [{
      type: Input
    }],
    cellSelection: [{
      type: Input
    }],
    rowMultiSelectWithClick: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowDeselection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowClickSelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressCellFocus: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressHeaderFocus: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    selectionColumnDef: [{
      type: Input
    }],
    rowNumbers: [{
      type: Input
    }],
    suppressMultiRangeSelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableCellTextSelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableRangeSelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableRangeHandle: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    enableFillHandle: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    fillHandleDirection: [{
      type: Input
    }],
    suppressClearOnFillReduction: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    sortingOrder: [{
      type: Input
    }],
    accentedSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    unSortIcon: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressMultiSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    alwaysMultiSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    multiSortKey: [{
      type: Input
    }],
    suppressMaintainUnsortedOrder: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    icons: [{
      type: Input
    }],
    rowHeight: [{
      type: Input
    }],
    rowStyle: [{
      type: Input
    }],
    rowClass: [{
      type: Input
    }],
    rowClassRules: [{
      type: Input
    }],
    suppressRowHoverHighlight: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    suppressRowTransform: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    columnHoverHighlight: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    gridId: [{
      type: Input
    }],
    deltaSort: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    treeDataDisplayType: [{
      type: Input
    }],
    enableGroupEdit: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    initialState: [{
      type: Input
    }],
    theme: [{
      type: Input
    }],
    loadThemeGoogleFonts: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    themeCssLayer: [{
      type: Input
    }],
    styleNonce: [{
      type: Input
    }],
    themeStyleContainer: [{
      type: Input
    }],
    getContextMenuItems: [{
      type: Input
    }],
    getMainMenuItems: [{
      type: Input
    }],
    postProcessPopup: [{
      type: Input
    }],
    processUnpinnedColumns: [{
      type: Input
    }],
    processCellForClipboard: [{
      type: Input
    }],
    processHeaderForClipboard: [{
      type: Input
    }],
    processGroupHeaderForClipboard: [{
      type: Input
    }],
    processCellFromClipboard: [{
      type: Input
    }],
    sendToClipboard: [{
      type: Input
    }],
    processDataFromClipboard: [{
      type: Input
    }],
    isExternalFilterPresent: [{
      type: Input
    }],
    doesExternalFilterPass: [{
      type: Input
    }],
    getChartToolbarItems: [{
      type: Input
    }],
    createChartContainer: [{
      type: Input
    }],
    focusGridInnerElement: [{
      type: Input
    }],
    navigateToNextHeader: [{
      type: Input
    }],
    tabToNextHeader: [{
      type: Input
    }],
    navigateToNextCell: [{
      type: Input
    }],
    tabToNextCell: [{
      type: Input
    }],
    getLocaleText: [{
      type: Input
    }],
    getDocument: [{
      type: Input
    }],
    paginationNumberFormatter: [{
      type: Input
    }],
    getGroupRowAgg: [{
      type: Input
    }],
    isGroupOpenByDefault: [{
      type: Input
    }],
    initialGroupOrderComparator: [{
      type: Input
    }],
    processPivotResultColDef: [{
      type: Input
    }],
    processPivotResultColGroupDef: [{
      type: Input
    }],
    getDataPath: [{
      type: Input
    }],
    getChildCount: [{
      type: Input
    }],
    getServerSideGroupLevelParams: [{
      type: Input
    }],
    isServerSideGroupOpenByDefault: [{
      type: Input
    }],
    isApplyServerSideTransaction: [{
      type: Input
    }],
    isServerSideGroup: [{
      type: Input
    }],
    getServerSideGroupKey: [{
      type: Input
    }],
    getBusinessKeyForNode: [{
      type: Input
    }],
    getRowId: [{
      type: Input
    }],
    resetRowDataOnUpdate: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    processRowPostCreate: [{
      type: Input
    }],
    isRowSelectable: [{
      type: Input
    }],
    isRowMaster: [{
      type: Input
    }],
    fillOperation: [{
      type: Input
    }],
    postSortRows: [{
      type: Input
    }],
    getRowStyle: [{
      type: Input
    }],
    getRowClass: [{
      type: Input
    }],
    getRowHeight: [{
      type: Input
    }],
    isFullWidthRow: [{
      type: Input
    }],
    toolPanelVisibleChanged: [{
      type: Output
    }],
    toolPanelSizeChanged: [{
      type: Output
    }],
    columnMenuVisibleChanged: [{
      type: Output
    }],
    contextMenuVisibleChanged: [{
      type: Output
    }],
    cutStart: [{
      type: Output
    }],
    cutEnd: [{
      type: Output
    }],
    pasteStart: [{
      type: Output
    }],
    pasteEnd: [{
      type: Output
    }],
    columnVisible: [{
      type: Output
    }],
    columnPinned: [{
      type: Output
    }],
    columnResized: [{
      type: Output
    }],
    columnMoved: [{
      type: Output
    }],
    columnValueChanged: [{
      type: Output
    }],
    columnPivotModeChanged: [{
      type: Output
    }],
    columnPivotChanged: [{
      type: Output
    }],
    columnGroupOpened: [{
      type: Output
    }],
    newColumnsLoaded: [{
      type: Output
    }],
    gridColumnsChanged: [{
      type: Output
    }],
    displayedColumnsChanged: [{
      type: Output
    }],
    virtualColumnsChanged: [{
      type: Output
    }],
    columnEverythingChanged: [{
      type: Output
    }],
    columnHeaderMouseOver: [{
      type: Output
    }],
    columnHeaderMouseLeave: [{
      type: Output
    }],
    columnHeaderClicked: [{
      type: Output
    }],
    columnHeaderContextMenu: [{
      type: Output
    }],
    componentStateChanged: [{
      type: Output
    }],
    cellValueChanged: [{
      type: Output
    }],
    cellEditRequest: [{
      type: Output
    }],
    rowValueChanged: [{
      type: Output
    }],
    cellEditingStarted: [{
      type: Output
    }],
    cellEditingStopped: [{
      type: Output
    }],
    rowEditingStarted: [{
      type: Output
    }],
    rowEditingStopped: [{
      type: Output
    }],
    undoStarted: [{
      type: Output
    }],
    undoEnded: [{
      type: Output
    }],
    redoStarted: [{
      type: Output
    }],
    redoEnded: [{
      type: Output
    }],
    cellSelectionDeleteStart: [{
      type: Output
    }],
    cellSelectionDeleteEnd: [{
      type: Output
    }],
    rangeDeleteStart: [{
      type: Output
    }],
    rangeDeleteEnd: [{
      type: Output
    }],
    fillStart: [{
      type: Output
    }],
    fillEnd: [{
      type: Output
    }],
    filterOpened: [{
      type: Output
    }],
    filterChanged: [{
      type: Output
    }],
    filterModified: [{
      type: Output
    }],
    advancedFilterBuilderVisibleChanged: [{
      type: Output
    }],
    findChanged: [{
      type: Output
    }],
    chartCreated: [{
      type: Output
    }],
    chartRangeSelectionChanged: [{
      type: Output
    }],
    chartOptionsChanged: [{
      type: Output
    }],
    chartDestroyed: [{
      type: Output
    }],
    cellKeyDown: [{
      type: Output
    }],
    gridReady: [{
      type: Output
    }],
    firstDataRendered: [{
      type: Output
    }],
    gridSizeChanged: [{
      type: Output
    }],
    modelUpdated: [{
      type: Output
    }],
    virtualRowRemoved: [{
      type: Output
    }],
    viewportChanged: [{
      type: Output
    }],
    bodyScroll: [{
      type: Output
    }],
    bodyScrollEnd: [{
      type: Output
    }],
    dragStarted: [{
      type: Output
    }],
    dragStopped: [{
      type: Output
    }],
    dragCancelled: [{
      type: Output
    }],
    stateUpdated: [{
      type: Output
    }],
    paginationChanged: [{
      type: Output
    }],
    rowDragEnter: [{
      type: Output
    }],
    rowDragMove: [{
      type: Output
    }],
    rowDragLeave: [{
      type: Output
    }],
    rowDragEnd: [{
      type: Output
    }],
    rowDragCancel: [{
      type: Output
    }],
    rowResizeStarted: [{
      type: Output
    }],
    rowResizeEnded: [{
      type: Output
    }],
    columnRowGroupChanged: [{
      type: Output
    }],
    rowGroupOpened: [{
      type: Output
    }],
    expandOrCollapseAll: [{
      type: Output
    }],
    pivotMaxColumnsExceeded: [{
      type: Output
    }],
    pinnedRowDataChanged: [{
      type: Output
    }],
    pinnedRowsChanged: [{
      type: Output
    }],
    rowDataUpdated: [{
      type: Output
    }],
    asyncTransactionsFlushed: [{
      type: Output
    }],
    storeRefreshed: [{
      type: Output
    }],
    headerFocused: [{
      type: Output
    }],
    cellClicked: [{
      type: Output
    }],
    cellDoubleClicked: [{
      type: Output
    }],
    cellFocused: [{
      type: Output
    }],
    cellMouseOver: [{
      type: Output
    }],
    cellMouseOut: [{
      type: Output
    }],
    cellMouseDown: [{
      type: Output
    }],
    rowClicked: [{
      type: Output
    }],
    rowDoubleClicked: [{
      type: Output
    }],
    rowSelected: [{
      type: Output
    }],
    selectionChanged: [{
      type: Output
    }],
    cellContextMenu: [{
      type: Output
    }],
    rangeSelectionChanged: [{
      type: Output
    }],
    cellSelectionChanged: [{
      type: Output
    }],
    tooltipShow: [{
      type: Output
    }],
    tooltipHide: [{
      type: Output
    }],
    sortChanged: [{
      type: Output
    }]
  });
})();
var booleanMixedGridOptions = new Set(_BOOLEAN_MIXED_GRID_OPTIONS);
function getValueOrCoercedValue(key, valueToUse) {
  if (booleanMixedGridOptions.has(key)) {
    return valueToUse === "" ? true : valueToUse === "false" ? false : valueToUse;
  }
  return valueToUse;
}
var AgGridModule = class _AgGridModule {
  static {
    this.ɵfac = function AgGridModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AgGridModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _AgGridModule,
      imports: [AgGridAngular],
      exports: [AgGridAngular]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AgGridModule, [{
    type: NgModule,
    args: [{
      imports: [AgGridAngular],
      exports: [AgGridAngular]
    }]
  }], null, null);
})();
export {
  AgComponentContainer,
  AgGridAngular,
  AgGridModule,
  AngularFrameworkComponentWrapper,
  AngularFrameworkOverrides
};
//# sourceMappingURL=ag-grid-angular.js.map
