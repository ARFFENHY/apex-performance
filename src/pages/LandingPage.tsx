import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MagicDust } from "@/components/MagicDust";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play, ArrowRight, Dumbbell, Apple, TrendingUp, Check, Zap, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden relative">
      <MagicDust />

      {/* Navbar Minimalista tipo Nike */}
      <nav className="relative z-40 w-full px-6 py-4 flex items-center justify-between border-b border-white/10 glass bg-background/50 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
            <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">APEX PERFORMANCE</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          <a href="#" className="hover:text-primary transition-colors">Características</a>
          <a href="#" className="hover:text-primary transition-colors">Entrenadores</a>
          <a href="#" className="hover:text-primary transition-colors">Gimnasios</a>
          <a href="#" className="hover:text-primary transition-colors">Planes</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button variant="premium" className="rounded-full px-6 gap-2">
                Ir al Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/login">
                <Button className="w-full justify-start mt-2 gradient-primary text-primary-foreground border-none">
                  Acceso Plataforma
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image / Video Layer */}
        <div className="absolute inset-0 z-0 bg-black">
          {/* Overlay oscuro para contraste del texto */}
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=2670&auto=format&fit=crop"
            alt="Fitness Training"
            className="w-full h-full object-cover opacity-80 scale-105 transform hover:scale-100 transition-transform duration-[10s] ease-out"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-6 text-center md:text-left flex flex-col items-center md:items-start text-white">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-4"
          >
            La Evolución Del Entrenamiento
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tighter leading-[0.95] max-w-4xl"
          >
            TU POTENCIAL. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d053] to-[#00a843]">SIN LÍMITES.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-lg md:text-xl text-white/70 max-w-xl font-light"
          >
            Planes nutricionales, rutinas avanzadas y el mejor ecosistema para coaches y gimnasios. Explora la app que está cambiando las reglas del juego.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link to={user ? "/dashboard" : "/login"}>
              <Button size="lg" variant="premium" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg shadow-neon group">
                Acceso Plataforma
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="#descubrir">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg border-white/20 hover:bg-white/10 text-white">
                Descubrir la Plataforma
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Características Section */}
      <section id="descubrir" className="relative z-20 bg-background py-24 md:py-32 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Ecosistema FitFlow Pro</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight mb-6 leading-tight">
              Diseñado para el<br />máximo rendimiento
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Desde las repeticiones en el gimnasio hasta tus macros diarios, mantén todo sincronizado en una plataforma única y profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -8 }} className="feature-card p-10 flex flex-col items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Dumbbell className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold font-display mt-2 text-white">Rutinas Avanzadas</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Programación de entrenamientos inteligentes. Registra pesos, series, repeticiones y mira videos de cada ejercicio para dominar tu técnica.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="feature-card p-10 flex flex-col items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Apple className="h-7 w-7 text-energy" />
              </div>
              <h3 className="text-2xl font-bold font-display mt-2 text-white">Nutrición Precisa</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Calculadora inteligente de macros y dietas personalizadas para cada objetivo (pérdida de grasa, ganancia muscular o mantenimiento).
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -8 }} className="feature-card p-10 flex flex-col items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <TrendingUp className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-2xl font-bold font-display mt-2 text-white">Progreso Visual</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Gráficos estadísticos y seguimiento de composición corporal. Todo lo que no se mide no se puede mejorar.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Entrenadores Section */}
      <section className="relative z-20 py-24 md:py-32 overflow-hidden bg-black border-y border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-black opacity-50" />
        <div className="container relative z-10 mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Target className="h-4 w-4" /> Para Profesionales
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                Herramientas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Poderosas</span> <br />para Coaches
              </h2>
              <p className="text-lg text-white/60 font-light max-w-xl leading-relaxed">
                Empodera tus servicios de entrenamiento personal con tecnología de primer nivel. Asigna rutinas, audita los alimentos consumidos y comunícate en tiempo real con cientos de clientes de manera centralizada.
              </p>
              <ul className="space-y-4 pt-4">
                {['Dashboard unificado de clientes', 'Librería de ejercicios personalizable', 'Chat integrado', 'Alertas de estancamiento automáticas'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Check className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:w-1/2 relative w-full h-[500px]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/5 to-white/0 border border-white/10 backdrop-blur-sm overflow-hidden flex items-center justify-center p-8">
                {/* Decorative graphic mockup */}
                <div className="w-full h-full relative">
                  <div className="absolute top-10 left-10 w-3/4 h-32 rounded-xl bg-white/5 border border-white/10 shadow-2xl flex items-center p-4 gap-4 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-white/10" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-1/3 bg-white/20 rounded-full" />
                      <div className="h-3 w-1/4 bg-white/10 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute top-32 right-10 w-2/3 h-48 rounded-xl bg-white/5 border border-white/10 shadow-2xl p-6 mt-10">
                    <div className="w-full h-full flex items-end gap-2">
                      {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                        <div key={i} className="w-full bg-primary/60 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="relative z-20 bg-background py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight mb-4">Membresías Flexibles</h2>
            <p className="text-muted-foreground text-lg">Invierte en tu salud física con nuestros planes y herramientas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center" style={{ perspective: 1000 }}>
            {/* Plan Básico */}
            <motion.div
              whileHover={{ scale: 1.05, y: -10, rotateX: 2, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-border/50 bg-card p-10 shadow-xl relative overflow-hidden transition-all hover:border-border hover:shadow-2xl cursor-pointer"
            >
              <h3 className="text-2xl font-bold font-display text-foreground">Básico</h3>
              <p className="text-muted-foreground mt-2 text-sm">Perfecto para comenzar a entrenar de manera organizada.</p>
              <div className="my-6">
                <span className="text-5xl font-black tracking-tight text-foreground">$25</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Acceso a librería de ejercicios', 'Calculadora de macronutrientes', 'Registro de peso semanal'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-xl h-12 text-foreground border-border hover:bg-accent hover:text-accent-foreground">
                Comenzar con Básico
              </Button>
            </motion.div>

            {/* Plan Pro */}
            <motion.div
              whileHover={{ scale: 1.05, y: -15, rotateX: 2, rotateY: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-3xl border border-primary/50 bg-black p-10 shadow-neon relative overflow-hidden transform md:-translate-y-4 cursor-pointer hover:shadow-[0_0_50px_rgba(0,208,83,0.35)]"
            >
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Más Popular
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-bold font-display text-white">Pro</h3>
              </div>
              <p className="text-white/60 mt-2 text-sm">Todas las herramientas avanzadas para desbloquear tu versión final.</p>
              <div className="my-6">
                <span className="text-5xl font-black tracking-tight text-white">$49</span>
                <span className="text-white/60">/mes</span>
              </div>
              <ul className="space-y-4 mb-8 relative z-10">
                {['Todo lo del plan Básico', 'Rutinas personalizadas dinámicas', 'Chat 1 a 1', 'Métricas y tracking completo', 'Soporte prioritario 24/7'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm text-white">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="premium" className="w-full rounded-xl h-12 shadow-neon relative z-10">
                Elegir Plan Pro
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
