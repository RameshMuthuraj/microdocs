import { SimpleChange, OnChanges, OnDestroy, AfterViewInit, ViewContainerRef, ChangeDetectorRef, EventEmitter, ElementRef, OnInit, NgZone } from "@angular/core";
import { EaseAnimationUtil } from "../../helpers/ease-animation.util";
import { HotlinkService } from "../../services/hotlink.service";
import { PreferenceService } from "../../services/preference.service";
import { Subscription } from "rxjs/Rx";
export declare class CardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    private animate;
    private hotlinks;
    private viewContainer;
    private cd;
    private zone;
    private preferenceService;
    title: string;
    sectionClass: string;
    subTitle: string;
    loading: any;
    private: boolean;
    hasHeader: boolean;
    canHide: boolean;
    canFullscreen: boolean;
    detectPosition: boolean;
    visible: EventEmitter<{}>;
    hidden: boolean;
    loaderValue: number;
    id: string;
    fullscreen: boolean;
    _visible: boolean;
    outerCardElement: ElementRef;
    scrollSubscription: Subscription;
    constructor(animate: EaseAnimationUtil, hotlinks: HotlinkService, viewContainer: ViewContainerRef, cd: ChangeDetectorRef, zone: NgZone, preferenceService: PreferenceService);
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngAfterViewInit(): void;
    ngOnChanges(changes: {
        [propName: string]: SimpleChange;
    }): void;
    showLoader(): void;
    hideLoader(): void;
    show(): void;
    hide(): void;
    isCardVisible(): boolean;
    private elementInViewport(el);
    private startLoader();
    private getHiddenStateFromPreferences();
    private setHiddenState(state);
}
