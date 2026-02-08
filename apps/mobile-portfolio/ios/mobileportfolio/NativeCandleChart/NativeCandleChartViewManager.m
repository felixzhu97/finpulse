#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(NativeCandleChart, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSArray)
RCT_EXPORT_VIEW_PROPERTY(theme, NSString)

@end
