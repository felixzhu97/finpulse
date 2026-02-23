#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(NativeSparkline, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(trend, NSString)
RCT_EXPORT_VIEW_PROPERTY(data, NSArray)

@end
