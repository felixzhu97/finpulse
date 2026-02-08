#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(NativeBaselineChart, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSArray)
RCT_EXPORT_VIEW_PROPERTY(baselineValue, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(theme, NSString)

@end
