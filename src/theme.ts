import type { ThemeConfig } from 'antd';

export function createTheme(): ThemeConfig {
  const styles = getComputedStyle(document.documentElement);
  const value = (name: string) => styles.getPropertyValue(name).trim();
  return {
    token: {
      colorPrimary: value('--blue'), colorText: value('--ink'), colorTextSecondary: value('--muted'),
      colorBorder: value('--line'), colorBgLayout: value('--page'), colorBgContainer: value('--surface'),
      fontFamily: 'var(--font-ui)', fontFamilyCode: 'var(--font-code)', fontSize: 14, borderRadius: 6,
      controlHeight: 32, lineHeight: 1.5714286, motion: true
    },
    components: {
      Button: { primaryShadow: value('--button-primary-shadow'), defaultShadow: 'none', fontWeight: 500 },
      Tree: { titleHeight: 36, indentSize: 18, nodeHoverBg: value('--surface-hover'), nodeSelectedBg: value('--skill-selected'), nodeSelectedColor: value('--skill-ink') },
      Segmented: { itemSelectedBg: value('--control-selected-bg'), itemSelectedColor: value('--blue-strong'), trackBg: value('--surface') },
      Tabs: { itemColor: value('--muted'), itemSelectedColor: value('--blue'), horizontalItemGutter: 20, titleFontSize: 14 },
      Table: { headerBg: value('--table-header-bg'), headerColor: value('--table-header-ink'), cellPaddingBlockSM: 10, cellPaddingInlineSM: 11, borderColor: value('--line') },
      Tag: { defaultBg: value('--surface'), defaultColor: value('--tag-ink') },
      Modal: { titleFontSize: 20 }, Drawer: { footerPaddingBlock: 16, footerPaddingInline: 20 }
    }
  };
}
