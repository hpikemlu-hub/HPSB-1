// Navigation Helper - Prevent page refresh and ensure smooth SPA navigation
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';

export interface NavigationOptions {
  showToast?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
}

export class NavigationHelper {
  private static instance: NavigationHelper;
  private router: AppRouterInstance | null = null;
  private isNavigating = false;

  static getInstance(): NavigationHelper {
    if (!NavigationHelper.instance) {
      NavigationHelper.instance = new NavigationHelper();
    }
    return NavigationHelper.instance;
  }

  setRouter(router: AppRouterInstance) {
    this.router = router;
  }

  /**
   * Safe navigation that prevents page refresh
   */
  async navigateTo(
    path: string, 
    options: NavigationOptions = {}
  ): Promise<boolean> {
    if (!this.router) {
      console.error('❌ Router not available for navigation');
      return false;
    }

    if (this.isNavigating) {
      console.warn('⚠️ Navigation already in progress');
      return false;
    }

    const {
      showToast = true,
      loadingMessage = 'Navigating...',
      errorMessage = 'Navigation failed'
    } = options;

    this.isNavigating = true;

    try {
      // Prevent any form submissions
      this.preventFormSubmissions();

      // Prevent browser back/forward interference
      window.history.pushState({}, '', window.location.pathname);

      console.log(`🧭 Navigating to: ${path}`);

      if (showToast) {
        toast.success(loadingMessage, {
          description: `Loading ${path}`,
          duration: 2000
        });
      }

      // Use Next.js router for client-side navigation
      await this.router.push(path);
      
      console.log(`✅ Navigation successful: ${path}`);
      return true;

    } catch (error) {
      console.error(`❌ Navigation failed:`, error);
      
      if (showToast) {
        toast.error(errorMessage, {
          description: 'Please try again or check the console for details.',
          duration: 5000
        });
      }
      
      return false;
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Prevent any form submissions that might cause page refresh
   */
  private preventFormSubmissions() {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add temporary submit prevention
      const preventSubmit = (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.warn('⚠️ Form submission prevented during navigation');
      };
      
      form.addEventListener('submit', preventSubmit, { once: true });
      
      // Remove prevention after a short delay
      setTimeout(() => {
        form.removeEventListener('submit', preventSubmit);
      }, 1000);
    });
  }

  /**
   * Enhanced click handler for navigation buttons
   */
  static createSafeClickHandler(
    path: string,
    options: NavigationOptions = {}
  ) {
    return async (e: React.MouseEvent<HTMLElement>) => {
      // Comprehensive event prevention
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation();

      // Additional safety checks
      const target = e.currentTarget;
      
      // Check if button is inside a form
      const form = target.closest('form');
      if (form) {
        console.warn('⚠️ Navigation button is inside a form - extra prevention applied');
        form.addEventListener('submit', (formEvent) => {
          formEvent.preventDefault();
          formEvent.stopImmediatePropagation();
        }, { once: true });
      }

      // Check button type
      if (target.getAttribute('type') !== 'button') {
        console.warn('⚠️ Button should have type="button" to prevent form submission');
      }

      // Execute navigation
      const navHelper = NavigationHelper.getInstance();
      return await navHelper.navigateTo(path, options);
    };
  }

  /**
   * Get current navigation state
   */
  isCurrentlyNavigating(): boolean {
    return this.isNavigating;
  }

  /**
   * Initialize global navigation monitoring
   */
  initGlobalMonitoring() {
    // Monitor for unexpected page refreshes
    let refreshAttempted = false;
    
    window.addEventListener('beforeunload', (e) => {
      if (!refreshAttempted) {
        refreshAttempted = true;
        console.warn('🚨 UNEXPECTED PAGE REFRESH DETECTED!');
        console.trace('Refresh source:');
      }
    });

    // Monitor form submissions globally
    document.addEventListener('submit', (e) => {
      if (this.isNavigating) {
        console.warn('⚠️ Form submission blocked during navigation');
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);

    console.log('✅ Global navigation monitoring initialized');
  }
}

export default NavigationHelper;