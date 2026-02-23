#import <React/RCTViewManager.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeLineChart, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSArray)
RCT_EXPORT_VIEW_PROPERTY(theme, NSString)
RCT_EXPORT_VIEW_PROPERTY(trend, NSString)
RCT_EXPORT_VIEW_PROPERTY(timestamps, NSArray)
RCT_EXPORT_VIEW_PROPERTY(baselineValue, NSNumber)

@end
