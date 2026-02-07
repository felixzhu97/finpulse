#import "NativeCardViewManager.h"
#import <React/RCTViewManager.h>
#import <UIKit/UIKit.h>

@interface NativeCardView : UIView
@property (nonatomic, copy) NSString *title;
@property (nonatomic, strong) UILabel *label;
@property (nonatomic, strong) UIView *contentView;
@end

@implementation NativeCardView

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.clipsToBounds = YES;
    self.backgroundColor = [UIColor colorWithWhite:0.85f alpha:1];
    _contentView = [[UIView alloc] initWithFrame:CGRectZero];
    _contentView.backgroundColor = [UIColor colorWithWhite:0.85f alpha:1];
    _contentView.layer.cornerRadius = 12;
    [self addSubview:_contentView];
    _label = [[UILabel alloc] initWithFrame:CGRectZero];
    _label.text = @"Native Card (iOS)";
    _label.textAlignment = NSTextAlignmentCenter;
    _label.font = [UIFont systemFontOfSize:16 weight:UIFontWeightMedium];
    _label.textColor = UIColor.labelColor;
    [_contentView addSubview:_label];
  }
  return self;
}

- (void)setTitle:(NSString *)title {
  _title = [title copy];
  _label.text = title.length ? title : @"Native Card (iOS)";
}

- (void)layoutSubviews {
  [super layoutSubviews];
  _contentView.frame = self.bounds;
  _label.frame = CGRectInset(_contentView.bounds, 16, 0);
}

@end

@implementation NativeCardViewManager

RCT_EXPORT_MODULE(NativeCard)

RCT_EXPORT_VIEW_PROPERTY(title, NSString)

- (UIView *)view {
  return [[NativeCardView alloc] init];
}

@end
