// src/screens/aluno/AlunoScreens.tsx
// ─────────────────────────────────────────
// Camis FIT — Todas as telas do Aluno
// ─────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, KeyboardAvoidingView, Platform,
  Animated, Easing,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Card, StatCard, SectionTitle, Input, StatusBadge, Tag, ProgressBar, Divider, Avatar } from '../../components';
import { useStore } from '../../services/store';

// ── Home Aluno ─────────────────────────
export const AlunoHomeScreen = ({ navigation }: any) => {
  const { user, treinos, minhasFaturas, evolucao } = useStore();
  const hoje = treinos[0];
  const progSemanal = 4;
  const totalDias = 5;
  const fatPendente = minhasFaturas.find(f => f.status === 'pendente' || f.status === 'vencido');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.lg, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, color: Colors.textSub }}>Bom dia,</Text>
            <Text style={{ fontSize: 22, fontWeight: Typography.weights.black }}>{user?.nome?.split(' ')[0]} <Text style={{ color: Colors.neon }}>⚡</Text></Text>
          </View>
          <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 }}>
            <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.neon }}>Treino hoje</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: Spacing.lg }}>
        {/* Treino do dia */}
        {hoje && (
          <Card neon style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: Typography.weights.bold }}>Treino de hoje</Text>
                <Text style={{ fontSize: 17, fontWeight: Typography.weights.black, marginTop: 3 }}>{hoje.titulo}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 2 }}>Prof. {user?.instrutorNome} · {hoje.exercicios.length} exercícios · {hoje.duracao} min</Text>
              </View>
              <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, borderRadius: 12, padding: 10 }}>
                <Text style={{ fontSize: 20 }}>🏋️</Text>
              </View>
            </View>
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 10, color: Colors.textSub }}>Progresso semanal</Text>
                <Text style={{ fontSize: 10, color: Colors.neon, fontWeight: Typography.weights.bold }}>{progSemanal}/{totalDias} dias</Text>
              </View>
              <ProgressBar progress={progSemanal / totalDias} />
            </View>
            <NeonButton label="▶  Iniciar treino" onPress={() => navigation.navigate('TreinoAluno')} />
          </Card>
        )}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.neon }}>{user?.peso}kg</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Peso atual</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.amber }}>
              {evolucao.length > 1 ? ((evolucao[evolucao.length - 1].peso - evolucao[0].peso) > 0 ? '+' : '') + (evolucao[evolucao.length - 1].peso - evolucao[0].peso).toFixed(1) : '0'}kg
            </Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Evolução</Text>
          </View>
        </View>

        {/* Fatura pendente */}
        {fatPendente && (
          <>
            <SectionTitle title="Atenção" />
            <View style={{ backgroundColor: Colors.pendenteDim, borderWidth: 1, borderColor: Colors.pendente + '50', borderRadius: Radius.lg, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 20 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: Colors.amber }}>Fatura pendente</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub }}>{fatPendente.descricao} · R${fatPendente.valor}</Text>
              </View>
              <NeonButton label="Pagar" variant="ghost" onPress={() => navigation.navigate('FaturasAluno')} small style={{ paddingHorizontal: 12 }} />
            </View>
          </>
        )}

        {/* Notificações */}
        <SectionTitle title="Notificações" />
        {[
          { icon: '🏋️', title: 'Novo treino liberado!', sub: 'Ficha B atualizada pela instrutora · agora', bg: Colors.neonDim, border: Colors.neonBorder },
          { icon: '📊', title: 'Evolução registrada', sub: 'Você perdeu 0.3kg esta semana! Continue assim', bg: Colors.neonDim, border: Colors.neonBorder },
        ].map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, backgroundColor: Colors.card2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 7 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: n.bg, borderWidth: 1, borderColor: n.border, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16 }}>{n.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold }}>{n.title}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{n.sub}</Text>
            </View>
          </View>
        ))}

        {/* Registrar evolução */}
        <SectionTitle title="Registrar evolução" />
        <RegistrarEvolucaoCard />
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

// ── Registrar Evolução Card ─────────────
const RegistrarEvolucaoCard = () => {
  const [peso, setPeso] = useState('');
  const [gordura, setGordura] = useState('');
  const addEvolucao = useStore(s => s.addEvolucao);

  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <View style={{ flex: 1 }}><Input label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="78.5" keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><Input label="% gordura" value={gordura} onChangeText={setGordura} placeholder="14.0" keyboardType="numeric" /></View>
      </View>
      <NeonButton label="Salvar medidas" variant="ghost" onPress={() => {
        if (!peso) { Alert.alert('Informe o peso'); return; }
        addEvolucao({ data: new Date().toISOString().split('T')[0], peso: parseFloat(peso), gordura: parseFloat(gordura) || 0 });
        setPeso(''); setGordura('');
        Alert.alert('Registrado!', 'Sua evolução foi salva.');
      }} small />
    </Card>
  );
};

// ── Tela de Treino + Cronômetro ─────────
export const TreinoAlunoScreen = ({ navigation }: any) => {
  const { treinos } = useStore();
  const ficha = treinos[0];

  const [timerSecs, setTimerSecs] = useState(90);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setTimerSecs(prev => {
          if (prev <= 0) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const resetTimer = (s = 90) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setTimerSecs(s);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const [diaAtivo, setDiaAtivo] = useState(0);

  if (!ficha) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.lg, paddingTop: 50 }}>
        <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: Typography.weights.bold }}>Segunda-feira</Text>
        <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, marginBottom: 10 }}>
          {ficha.titulo.split('—')[1]?.trim() || ficha.titulo}
        </Text>
        {/* Seletor de dias */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {dias.map((d, i) => (
              <TouchableOpacity key={d} onPress={() => setDiaAtivo(i)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: diaAtivo === i ? Colors.neonBorder : Colors.border, backgroundColor: diaAtivo === i ? Colors.neonDim : Colors.card2 }}>
                <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: diaAtivo === i ? Colors.neon : Colors.textSub }}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={{ padding: Spacing.lg }}>
        {/* Cronômetro */}
        <View style={{ backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.neonBorder, borderRadius: Radius.xl, padding: 20, alignItems: 'center', marginBottom: 14, ...Shadows.neonSm }}>
          <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: Typography.weights.bold, marginBottom: 6 }}>
            Descanso entre séries
          </Text>
          <Text style={{
            fontSize: 56, fontWeight: Typography.weights.black,
            color: timerSecs < 10 ? Colors.red : Colors.neon,
            letterSpacing: 2, fontVariant: ['tabular-nums'],
            textShadowColor: timerSecs < 10 ? Colors.red : Colors.neon,
            textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20,
          }}>
            {formatTime(timerSecs)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity onPress={toggleTimer} style={{ paddingHorizontal: 22, paddingVertical: 11, backgroundColor: Colors.neon, borderRadius: Radius.md, flexDirection: 'row', alignItems: 'center', gap: 6, ...Shadows.neon }}>
              <Text style={{ fontSize: 14, fontWeight: Typography.weights.black, color: '#000' }}>{running ? '⏸ Pause' : '▶ Play'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetTimer(90)} style={{ paddingHorizontal: 16, paddingVertical: 11, backgroundColor: Colors.card2, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 14, color: Colors.textMid }}>↺</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 7, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[30, 60, 90, 120, 180].map(s => (
              <TouchableOpacity key={s} onPress={() => resetTimer(s)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.neonBorder, backgroundColor: Colors.neonDim }}>
                <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.neon }}>{s < 60 ? s + 's' : s / 60 + (s % 60 ? ':' + String(s % 60).padStart(2, '0') : '') + 'min'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercícios */}
        <SectionTitle title={`Exercícios · ${ficha.nivel}`} />
        {ficha.exercicios.map((ex, i) => (
          <View key={ex.id} style={{ backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl, padding: 12, marginBottom: 9, flexDirection: 'row', gap: 11, alignItems: 'center' }}>
            {/* Animação do boneco */}
            <StickFigure exercicio={ex.nome} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, marginBottom: 3 }}>{i + 1}. {ex.nome}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub, marginBottom: 5 }}>{ex.series} séries · {ex.repeticoes} reps{ex.descanso ? ' · ' + ex.descanso : ''}</Text>
              {ex.observacao && <Text style={{ fontSize: 11, color: Colors.textMid, fontStyle: 'italic' }}>{ex.observacao}</Text>}
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
                <Tag label={ex.grupoMuscular} color="green" />
              </View>
            </View>
          </View>
        ))}

        <NeonButton label="Finalizar treino" onPress={() => { Alert.alert('Treino concluído! 🔥', `${ficha.exercicios.length} exercícios completados. +50 XP ganhos!`); navigation.goBack(); }} style={{ marginTop: 4 }} />
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

// ── Stick Figure Animation ──────────────
const StickFigure: React.FC<{ exercicio: string }> = ({ exercicio }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const e = exercicio.toLowerCase();
  const isPush = e.includes('supino') || e.includes('flexão') || e.includes('tríceps');
  const isPull = e.includes('puxada') || e.includes('barra') || e.includes('remada');
  const isLeg  = e.includes('agachamento') || e.includes('leg') || e.includes('cadeira');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const color = isPush ? Colors.neon : isPull ? Colors.blue : isLeg ? Colors.amber : Colors.neon;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, isLeg ? 5 : -5] });

  return (
    <Animated.View style={{ width: 56, height: 56, backgroundColor: Colors.card2, borderRadius: 13, borderWidth: 1, borderColor: color + '60', alignItems: 'center', justifyContent: 'center', transform: [{ translateY }] }}>
      <Text style={{ fontSize: 26 }}>{isPush ? '💪' : isPull ? '🤸' : isLeg ? '🏃' : '⚡'}</Text>
    </Animated.View>
  );
};

// ── Camila IA ──────────────────────────
export const CamilaScreen = () => {
  const { user, mensagens, addMensagem } = useStore();
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const enviar = async () => {
    const txt = texto.trim();
    if (!txt || loading) return;
    setTexto('');

    const userMsg = { id: Date.now().toString(), remetente: 'usuario' as const, conteudo: txt, timestamp: new Date() };
    addMensagem(userMsg);
    setLoading(true);

    // Call your backend: camilaAPI.chat(txt, { nome: user?.nome, peso: user?.peso, objetivo: user?.objetivo })
    // Demo response:
    setTimeout(() => {
      const respostas = [
        `Ótima pergunta, ${user?.nome?.split(' ')[0]}! Para ${user?.objetivo || 'seu objetivo'}, recomendo focar em exercícios compostos como agachamento, supino e levantamento terra. Quer que eu monte um plano específico para você?`,
        `Com base no seu histórico, você está evoluindo muito bem! Seu peso atual de ${user?.peso}kg mostra progresso consistente. Continue assim e mantenha a dieta alinhada!`,
        `Isso é super importante para ${user?.objetivo || 'seu objetivo'}! A periodização do treino faz toda a diferença. Vou sugerir alguns ajustes para maximizar seus resultados.`,
      ];
      const resp = respostas[Math.floor(Math.random() * respostas.length)];
      addMensagem({ id: Date.now().toString() + '_c', remetente: 'camila', conteudo: resp, timestamp: new Date() });
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header Camila */}
      <View style={{ backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.lg, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ff4ecd40', borderWidth: 2, borderColor: Colors.pink, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.pink }}>C</Text>
            </View>
            <View style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.neon, borderWidth: 2, borderColor: Colors.bg2 }} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: Typography.weights.black }}>Camila</Text>
            <Text style={{ fontSize: 11, color: Colors.neon, fontWeight: Typography.weights.bold }}>Coach IA · Online agora</Text>
          </View>
        </View>
      </View>

      {/* Mensagens */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg }} showsVerticalScrollIndicator={false}>
        {mensagens.map(msg => (
          <View key={msg.id} style={{ marginBottom: 10, alignItems: msg.remetente === 'usuario' ? 'flex-end' : 'flex-start' }}>
            {msg.remetente === 'camila' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.neon }} />
                <Text style={{ fontSize: 10, color: Colors.neon, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1 }}>Camila · Coach IA</Text>
              </View>
            )}
            <View style={{
              backgroundColor: msg.remetente === 'camila' ? Colors.card : Colors.card2,
              borderWidth: 1,
              borderColor: msg.remetente === 'camila' ? Colors.neonBorder : Colors.border,
              borderRadius: msg.remetente === 'camila' ? 18 : 18,
              borderBottomLeftRadius: msg.remetente === 'camila' ? 4 : 18,
              borderBottomRightRadius: msg.remetente === 'usuario' ? 4 : 18,
              padding: 12,
              maxWidth: '88%',
            }}>
              <Text style={{ fontSize: 13, color: Colors.text, lineHeight: 20 }}>{msg.conteudo}</Text>
            </View>
            {msg.remetente === 'camila' && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {['Montar meu treino', 'Plano de dieta', 'Dicas de execução'].slice(0, 2).map(a => (
                  <TouchableOpacity key={a} onPress={() => { setTexto(a); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.neonBorder, backgroundColor: Colors.neonDim }}>
                    <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.neon }}>{a} ↗</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.neon }} />
            <Text style={{ fontSize: 12, color: Colors.textSub, fontStyle: 'italic' }}>Camila está digitando...</Text>
          </View>
        )}
        <View style={{ height: 8 }} />
      </ScrollView>

      {/* Sugestões rápidas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8, alignItems: 'center' }}>
        {['Monte meu treino da semana', 'Calcular minha dieta', 'Posso substituir este exercício?', 'Analise minha evolução'].map(s => (
          <TouchableOpacity key={s} onPress={() => setTexto(s)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.neonBorder, backgroundColor: Colors.neonDim }}>
            <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.neon }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={{ padding: Spacing.md, paddingBottom: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bg2, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Pergunte pra Camila..."
          placeholderTextColor={Colors.textFaint}
          onSubmitEditing={enviar}
          style={{ flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 13, paddingVertical: 11, color: Colors.text, fontSize: 13 }}
        />
        <TouchableOpacity onPress={enviar} style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, color: '#fff' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ── Faturas Aluno ──────────────────────
export const FaturasAlunoScreen = () => {
  const { minhasFaturas } = useStore();
  const totalPago = minhasFaturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = minhasFaturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.lg, paddingTop: 50 }}>
        <Text style={{ fontSize: 20, fontWeight: Typography.weights.black }}>Minhas Faturas</Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginTop: 2 }}>Prof. Ana Beatriz</Text>
      </View>

      <View style={{ padding: Spacing.lg }}>
        <Card neon style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.neon }}>R${totalPago.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Pago em 2025</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.amber }}>R${totalPendente.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Pendente</Text>
            </View>
          </View>
        </Card>

        {minhasFaturas.map(fat => (
          <View key={fat.id} style={{ backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: fat.status === 'pendente' ? Colors.neonBorder : Colors.border, padding: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold }}>{fat.descricao}</Text>
              <Text style={{ fontSize: 15, fontWeight: Typography.weights.black, color: Colors.neon }}>R${fat.valor.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: fat.status !== 'pago' ? 10 : 0 }}>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>
                {fat.status === 'pago' ? `Pago em ${fat.pagoEm?.slice(8, 10)}/${fat.pagoEm?.slice(5, 7)}/${fat.pagoEm?.slice(0, 4)}` : `Vence: ${fat.vencimento.slice(8, 10)}/${fat.vencimento.slice(5, 7)}/${fat.vencimento.slice(0, 4)}`}
              </Text>
              <StatusBadge status={fat.status} />
            </View>
            {fat.status !== 'pago' && (
              <NeonButton label="Pagar agora" onPress={() => Alert.alert('Pagamento', 'Escolha o método: Pix, Cartão ou Boleto', [
                { text: 'Pix', onPress: () => Alert.alert('Pix gerado!', 'Escaneie o QR code para pagar.') },
                { text: 'Cartão', onPress: () => Alert.alert('Redirecionando...', 'Abrindo checkout seguro.') },
                { text: 'Cancelar', style: 'cancel' },
              ])} small />
            )}
          </View>
        ))}
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

// ── Evolução Aluno ─────────────────────
export const EvolucaoAlunoScreen = () => {
  const { evolucao } = useStore();
  const pesoInicial = evolucao[0]?.peso || 80;
  const pesoAtual = evolucao[evolucao.length - 1]?.peso || 78;
  const diff = (pesoAtual - pesoInicial).toFixed(1);

  const maxPeso = Math.max(...evolucao.map(e => e.peso));
  const minPeso = Math.min(...evolucao.map(e => e.peso));

  const badges = [
    { icon: '🏆', nome: 'Primeira semana', earned: true },
    { icon: '💪', nome: '30 treinos', earned: true },
    { icon: '🔥', nome: 'Meta calórica', earned: true },
    { icon: '⚡', nome: '100 treinos', earned: false },
    { icon: '👑', nome: 'Campeão', earned: false },
    { icon: '🌟', nome: 'Mês perfeito', earned: false },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border, padding: Spacing.lg, paddingTop: 50 }}>
        <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: Typography.weights.bold, marginBottom: 2 }}>Sua jornada</Text>
        <Text style={{ fontSize: 20, fontWeight: Typography.weights.black }}>Evolução corporal</Text>
      </View>

      <View style={{ padding: Spacing.lg }}>
        {/* Comparativo */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', marginBottom: 4 }}>Peso inicial</Text>
            <Text style={{ fontSize: 24, fontWeight: Typography.weights.black }}>{pesoInicial}<Text style={{ fontSize: 14 }}>kg</Text></Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neonBorder, padding: 12, alignItems: 'center', ...Shadows.neonSm }}>
            <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', marginBottom: 4 }}>Peso atual</Text>
            <Text style={{ fontSize: 24, fontWeight: Typography.weights.black, color: Colors.neon }}>{pesoAtual}<Text style={{ fontSize: 14 }}>kg</Text></Text>
            <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: Number(diff) < 0 ? Colors.neon : Colors.red, marginTop: 2 }}>{Number(diff) > 0 ? '+' : ''}{diff}kg {Number(diff) < 0 ? '▼' : '▲'}</Text>
          </View>
        </View>

        {/* Gráfico de peso simples */}
        <Card neon style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold }}>Evolução do peso (kg)</Text>
            <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1, borderColor: Colors.neonBorder, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 11, color: Colors.neon, fontWeight: Typography.weights.bold }}>{diff}kg</Text>
            </View>
          </View>
          <View style={{ height: 80, flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            {evolucao.map((e, i) => {
              const h = maxPeso === minPeso ? 50 : ((e.peso - minPeso) / (maxPeso - minPeso)) * 60 + 10;
              const isLast = i === evolucao.length - 1;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{ height: h, backgroundColor: isLast ? Colors.neon : Colors.card3, borderRadius: 4, width: '100%', borderWidth: isLast ? 1 : 0, borderColor: Colors.neon, ...(isLast ? Shadows.neonSm : {}) }} />
                  <Text style={{ fontSize: 9, color: Colors.textSub }}>{e.peso}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.neon }}>47</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Treinos total</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.amber }}>28.4k</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Kcal gastas</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: Typography.weights.black, color: Colors.blue }}>14%</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Gordura</Text>
          </View>
        </View>

        {/* Conquistas */}
        <SectionTitle title="Conquistas e medalhas" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {badges.map((b, i) => (
            <View key={i} style={{ width: '30%', backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: b.earned ? Colors.neonBorder : Colors.border, padding: 10, alignItems: 'center', opacity: b.earned ? 1 : 0.45, ...(b.earned ? Shadows.neonSm : {}) }}>
              <Text style={{ fontSize: 26, marginBottom: 5 }}>{b.icon}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textAlign: 'center', fontWeight: Typography.weights.bold, textTransform: 'uppercase' }}>{b.nome}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
};

// ── Perfil Aluno ───────────────────────
export const PerfilAlunoScreen = () => {
  const { user, logout } = useStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: Colors.card, padding: Spacing.xl, paddingTop: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.neonDim, borderWidth: 2.5, borderColor: Colors.neon, alignItems: 'center', justifyContent: 'center', marginBottom: 10, ...Shadows.neon }}>
          <Text style={{ fontSize: 28, fontWeight: Typography.weights.black, color: Colors.neon }}>{user?.avatarInitials}</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: Typography.weights.black }}>{user?.nome}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginTop: 2 }}>Aluno · {user?.instrutorNome}</Text>
        <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 5, marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: Typography.weights.bold, color: Colors.neon }}>Nível {user?.nivel} · {user?.xp} XP</Text>
        </View>
        <View style={{ width: '100%', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10, color: Colors.textSub }}>{user?.xp} XP</Text>
            <Text style={{ fontSize: 10, color: Colors.textSub }}>próximo nível: 1.000 XP</Text>
          </View>
          <ProgressBar progress={(user?.xp || 0) / 1000} />
        </View>
      </View>

      <View style={{ padding: Spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.neon }}>{user?.peso}kg</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Peso</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: Typography.weights.black }}>{user?.altura}cm</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Altura</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.neonBorder, padding: 12, alignItems: 'center', ...Shadows.neonSm }}>
            <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.amber }}>{user?.objetivo}</Text>
            <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Objetivo</Text>
          </View>
        </View>

        <SectionTitle title="Meu instrutor" />
        <View style={{ backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '70', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>AB</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold }}>{user?.instrutorNome}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSub }}>CREF 123456 · desde Jan/25</Text>
          </View>
        </View>

        {[
          { icon: '🎯', label: 'Objetivo', sub: user?.objetivo || '' },
          { icon: '🏋️', label: 'Nível de treino', sub: 'Intermediário' },
          { icon: '🔔', label: 'Notificações', sub: 'Ativas' },
          { icon: '⚙️', label: 'Configurações', sub: 'Conta e privacidade' },
        ].map(item => (
          <TouchableOpacity key={item.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: Typography.weights.medium }}>{item.label}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{item.sub}</Text>
            </View>
            <Text style={{ color: Colors.textSub, fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        ))}

        <NeonButton label="Sair da conta" variant="danger" onPress={() => Alert.alert('Sair?', '', [{ text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: logout }])} style={{ marginTop: 20 }} />
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};
