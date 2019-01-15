var GlobeTracker = function () {
    this.init.apply(this, arguments);
};

GlobeTracker.prototype = {
    viewer: null,
    ctrArr: [],
    pointDrawer: null,
    polylineDrawer: null,
    polygonDrawer: null,
    circleDrawer: null,
    rectDrawer: null,
    bufferLineDrawer: null,
    straightArrowDrawer: null,
    attackArrowDrawer: null,
    pincerArrowDrawer: null,
    posMeasure: null,
    disMeasure: null,
    areaMeasure: null,
    init: function (viewer) {
        var _this = this;
        _this.viewer = viewer;

        _this.pointDrawer = new GlobePointDrawer(_this.viewer);
        _this.ctrArr.push(_this.pointDrawer);

        _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer);
        _this.ctrArr.push(_this.polylineDrawer);

        _this.polygonDrawer = new GlobePolygonDrawer(_this.viewer);
        _this.ctrArr.push(_this.polygonDrawer);

        _this.circleDrawer = new GlobeCircleDrawer(_this.viewer);
        _this.ctrArr.push(_this.circleDrawer);

        _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
        _this.ctrArr.push(_this.rectDrawer);

        _this.bufferLineDrawer = new GlobeBufferLineDrawer(_this.viewer);
        _this.ctrArr.push(_this.bufferLineDrawer);

        _this.straightArrowDrawer = new PlotStraightArrowDrawer(_this.viewer);
        _this.ctrArr.push(_this.straightArrowDrawer);

        _this.attackArrowDrawer = new PlotAttackArrowDrawer(_this.viewer);
        _this.ctrArr.push(_this.attackArrowDrawer);

        _this.pincerArrowDrawer = new PlotPincerArrowDrawer(_this.viewer);
        _this.ctrArr.push(_this.pincerArrowDrawer);

        _this.posMeasure = new GlobePointMeasure(_this.viewer);
        _this.ctrArr.push(_this.posMeasure);

        _this.disMeasure = new GlobePolylineMeasure(_this.viewer);
        _this.ctrArr.push(_this.disMeasure);

        _this.areaMeasure = new GlobePolygonMeasure(_this.viewer);
        _this.ctrArr.push(_this.areaMeasure);
    },
    clear: function () {
        var _this = this;
        for (var i = 0; i < _this.ctrArr.length; i++) {
            try {
                var ctr = _this.ctrArr[i];
                if (ctr.clear) {
                    ctr.clear();
                }
            } catch (err) {
                console.log("发生未知出错：GlobeTracker.clear");
            }
        }
    },
    trackPoint: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.pointDrawer == null) {
            _this.pointDrawer = new GlobePointDrawer(_this.viewer);
            _this.ctrArr.push(_this.pointDrawer);
        }
        _this.pointDrawer.startDrawPoint(okHandler, cancelHandler);
    },
    trackPolyline: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.polylineDrawer == null) {
            _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer);
            _this.ctrArr.push(_this.polylineDrawer);
        }
        _this.polylineDrawer.startDrawPolyline(okHandler, cancelHandler);
    },
    trackPolygon: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.polygonDrawer == null) {
            _this.polygonDrawer = new GlobePolygonDrawer(_this.viewer);
            _this.ctrArr.push(_this.polygonDrawer);
        }
        _this.polygonDrawer.startDrawPolygon(okHandler, cancelHandler);
    },
    trackCircle: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.circleDrawer == null) {
            _this.circleDrawer = new GlobeCircleDrawer(_this.viewer);
            _this.ctrArr.push(_this.circleDrawer);
        }
        _this.circleDrawer.startDrawCircle(okHandler, cancelHandler);
    },
    trackRectangle: function (okHandler, cancelHandler) {
        var _this = this;
        if (_this.rectDrawer == null) {
            _this.rectDrawer = new GlobeRectangleDrawer(_this.viewer);
            _this.ctrArr.push(_this.rectDrawer);
        }
        _this.clear();
        _this.rectDrawer.startDrawRectangle(okHandler, cancelHandler);
    },
    trackBufferLine: function (okHandler, cancelHandler) {
        var _this = this;
        if (_this.bufferLineDrawer == null) {
            _this.bufferLineDrawer = new GlobeBufferLineDrawer(_this.viewer);
            _this.ctrArr.push(_this.bufferLineDrawer);
        }
        _this.clear();
        _this.bufferLineDrawer.startDrawBufferLine(okHandler, cancelHandler);
    },
    trackStraightArrow: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.straightArrowDrawer == null) {
            _this.straightArrowDrawer = new PlotStraightArrowDrawer(_this.viewer);
            _this.ctrArr.push(_this.straightArrowDrawer);
        }
        _this.straightArrowDrawer.startDrawStraightArrow(okHandler, cancelHandler);
    },
    trackAttackArrow: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.attackArrowDrawer == null) {
            _this.attackArrowDrawer = new PlotAttackArrowDrawer(_this.viewer);
            _this.ctrArr.push(_this.attackArrowDrawer);
        }
        _this.attackArrowDrawer.startDrawAttackArrow(okHandler, cancelHandler);
    },
    trackPincerArrow: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.pincerArrowDrawer == null) {
            _this.pincerArrowDrawer = new PlotPincerArrowDrawer(_this.viewer);
            _this.ctrArr.push(_this.pincerArrowDrawer);
        }
        _this.pincerArrowDrawer.startDrawPincerArrow(okHandler, cancelHandler);
    },
    pickPosition: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.posMeasure == null) {
            _this.posMeasure = new GlobePointMeasure(_this.viewer);
            _this.ctrArr.push(_this.posMeasure);
        }
        _this.posMeasure.startDrawPoint(okHandler, cancelHandler);
    },
    pickDistance: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.disMeasure == null) {
            _this.disMeasure = new GlobePolylineMeasure(_this.viewer);
            _this.ctrArr.push(_this.disMeasure);
        }
        _this.disMeasure.startDrawPolyline(okHandler, cancelHandler);
    },
    pickArea: function (okHandler, cancelHandler) {
        var _this = this;
        _this.clear();
        if (_this.areaMeasure == null) {
            _this.areaMeasure = new GlobePolygonMeasure(_this.viewer);
            _this.ctrArr.push(_this.areaMeasure);
        }
        _this.areaMeasure.startDrawPolygon(okHandler, cancelHandler);
    },
    CLASS_NAME: "GlobeTracker"
};