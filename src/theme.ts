import type { ThemeConfig } from 'antd';

export function createTheme(): ThemeConfig {
  const styles = getComputedStyle(document.documentElement);
  const value = (name: string) => styles.getPropertyValue(name).trim();
  const rootSize = parseFloat(styles.fontSize);
  // The shared typography scale is expressed in rem in site.css.
  const size = (name: string) => parseFloat(value(name)) * rootSize;
  const fontSize = size('--text-body');
  const controlHeight = 32;
  return {
    token: {
      colorPrimary: value('--blue'), colorText: value('--ink'), colorTextSecondary: value('--muted'),
      colorBorder: value('--line'), colorSplit: value('--line'), colorBgLayout: value('--page'), colorBgContainer: value('--surface'),
      fontFamily: value('--font-ui'), fontFamilyCode: value('--font-code'), fontSize,
      fontSizeSM: size('--text-xs'), fontSizeLG: size('--text-section'), fontSizeXL: size('--text-title'), borderRadius: 6,
      controlHeight, lineHeight: parseFloat(value('--line-body')), motion: true
    },
    components: {
      Button: { primaryShadow: value('--button-primary-shadow'), defaultShadow: 'none', fontWeight: 500 },
      Tree: { titleHeight: 36, indentSize: 16, switcherSize: 20, nodeHoverBg: value('--surface-hover'), nodeSelectedBg: value('--skill-selected'), nodeSelectedColor: value('--skill-ink') },
      Segmented: { controlHeight: controlHeight - 2, trackPadding: 0, itemSelectedBg: value('--control-selected-bg'), itemSelectedColor: value('--blue-strong'), trackBg: value('--surface') },
      Tabs: { itemColor: value('--muted'), itemSelectedColor: value('--blue'), horizontalItemGutter: 20, titleFontSize: fontSize },
      Table: { headerBg: value('--table-header-bg'), headerColor: value('--table-header-ink'), cellPaddingBlockSM: 10, cellPaddingInlineSM: 11, borderColor: value('--line') },
      Tag: { defaultBg: value('--surface'), defaultColor: value('--tag-ink') },
      Descriptions: { labelBg: value('--table-header-bg'), labelColor: value('--muted'), contentColor: value('--ink') },
      Modal: { titleFontSize: size('--text-title') }, Drawer: { footerPaddingBlock: 16, footerPaddingInline: 20 }
    }
  };
}
