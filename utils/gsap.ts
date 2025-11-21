import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export const useGSAP = () => {
  const timelineRef = useRef<gsap.core.Timeline>();

  useEffect(() => {
    // Limpiar timeline al desmontar
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return {
    // Animación de entrada para modales
    animateModalIn: (element: HTMLElement | string) => {
      gsap.set(element, { opacity: 0, scale: 0.9, y: 20 });
      gsap.to(element, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)"
      });
    },

    // Animación de salida para modales
    animateModalOut: (element: HTMLElement | string, callback?: () => void) => {
      gsap.to(element, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        duration: 0.3,
        ease: "power2.in",
        onComplete: callback
      });
    },

    // Animación de hover para tarjetas
    animateHoverIn: (element: HTMLElement | string) => {
      gsap.to(element, {
        scale: 1.05,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      });
    },

    animateHoverOut: (element: HTMLElement | string) => {
      gsap.to(element, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    },

    // Animación de pulso para elementos activos
    animatePulse: (element: HTMLElement | string, duration: number = 2) => {
      gsap.to(element, {
        scale: 1.1,
        duration: duration / 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    },

    // Animación de carga (spinner)
    animateSpinner: (element: HTMLElement | string) => {
      gsap.to(element, {
        rotation: 360,
        duration: 1,
        ease: "none",
        repeat: -1
      });
    },

    // Animación de fade in
    animateFadeIn: (element: HTMLElement | string, delay: number = 0) => {
      gsap.set(element, { opacity: 0, y: 20 });
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        ease: "power2.out"
      });
    },

    // Animación de deslizamiento horizontal (carousel)
    animateSlide: (element: HTMLElement | string, direction: 'left' | 'right', duration: number = 0.5) => {
      const xValue = direction === 'left' ? -100 : 100;
      gsap.fromTo(element,
        { x: xValue + '%' },
        { x: '0%', duration, ease: "power2.out" }
      );
    },

    // Animación de escala para botones
    animateButtonHover: (element: HTMLElement | string, isHover: boolean) => {
      gsap.to(element, {
        scale: isHover ? 1.1 : 1,
        duration: 0.2,
        ease: "power2.out"
      });
    },

    // Animación de entrada escalonada para listas
    animateStaggerIn: (elements: HTMLElement[] | string, delay: number = 0.1) => {
      gsap.set(elements, { opacity: 0, y: 20 });
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: delay,
        ease: "power2.out"
      });
    },

    // Animación de bounce para elementos destacados
    animateBounce: (element: HTMLElement | string) => {
      gsap.to(element, {
        y: -10,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    },

    // Animación de glow (brillo pulsante)
    animateGlow: (element: HTMLElement | string, color: string = 'rgba(59, 130, 246, 0.5)') => {
      gsap.to(element, {
        boxShadow: `0 0 20px ${color}`,
        duration: 1,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    },

    // Animación de expansión de fondo
    animateBackgroundExpand: (element: HTMLElement | string) => {
      gsap.to(element, {
        scale: 1.2,
        duration: 0.5,
        ease: "power2.out"
      });
    },

    // Función genérica para crear timelines
    createTimeline: () => {
      timelineRef.current = gsap.timeline();
      return timelineRef.current;
    },

    // Función para matar todas las animaciones de un elemento
    killAnimations: (element: HTMLElement | string) => {
      gsap.killTweensOf(element);
    },

    // Función para setear propiedades iniciales
    set: (target: any, vars: any) => {
      gsap.set(target, vars);
    },

    // Función para animar a propiedades específicas
    to: (target: any, vars: any) => {
      gsap.to(target, vars);
    },

    // Función para animar desde propiedades específicas
    from: (target: any, vars: any) => {
      gsap.from(target, vars);
    },

    // Función para animar desde y hacia propiedades específicas
    fromTo: (target: any, fromVars: any, toVars: any) => {
      gsap.fromTo(target, fromVars, toVars);
    },

    // ===== FUNCIONES DE SCROLL =====

    // Animación que se activa al hacer scroll
    animateOnScroll: (element: HTMLElement | string, animationProps: any, triggerProps?: any) => {
      const defaultTriggerProps = {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...triggerProps
      };

      return gsap.fromTo(element, {
        ...animationProps.from
      }, {
        ...animationProps.to,
        scrollTrigger: defaultTriggerProps
      });
    },

    // Animación de fade in al hacer scroll
    animateFadeInOnScroll: (element: HTMLElement | string, delay: number = 0, triggerOffset: string = "top 80%") => {
      return gsap.fromTo(element, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: triggerOffset,
          toggleActions: "play none none reverse"
        }
      });
    },

    // Animación de slide in desde la izquierda al hacer scroll
    animateSlideInLeft: (element: HTMLElement | string, delay: number = 0) => {
      return gsap.fromTo(element, {
        opacity: 0,
        x: -100
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    },

    // Animación de slide in desde la derecha al hacer scroll
    animateSlideInRight: (element: HTMLElement | string, delay: number = 0) => {
      return gsap.fromTo(element, {
        opacity: 0,
        x: 100
      }, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    },

    // Animación de scale in al hacer scroll
    animateScaleInOnScroll: (element: HTMLElement | string, delay: number = 0) => {
      return gsap.fromTo(element, {
        opacity: 0,
        scale: 0.8
      }, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });
    },

    // Animación de stagger para múltiples elementos al hacer scroll
    animateStaggerOnScroll: (elements: HTMLElement[] | string, staggerDelay: number = 0.1, triggerOffset: string = "top 80%") => {
      return gsap.fromTo(elements, {
        opacity: 0,
        y: 30
      }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: staggerDelay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elements[0] || elements,
          start: triggerOffset,
          toggleActions: "play none none reverse"
        }
      });
    },

    // Crear un ScrollTrigger personalizado
    createScrollTrigger: (props: any) => {
      return ScrollTrigger.create(props);
    },

    // Obtener la instancia de ScrollTrigger
    getScrollTrigger: () => ScrollTrigger,

    // Función para actualizar todos los ScrollTriggers (útil después de cambios de layout)
    refreshScrollTriggers: () => {
      ScrollTrigger.refresh();
    },

    // Función para matar un ScrollTrigger específico
    killScrollTrigger: (trigger: ScrollTrigger) => {
      trigger.kill();
    },

    // Función para matar todos los ScrollTriggers
    killAllScrollTriggers: () => {
      ScrollTrigger.killAll();
    }
  };
};
