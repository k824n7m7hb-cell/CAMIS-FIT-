// src/screens/auth/AuthScreens.tsx
// ─────────────────────────────────────────
// Camis FIT — Auth: Welcome · Login · Cadastro
// ─────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, StyleSheet, Image,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const logo = require('../../../assets/logo.png');
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Input, Card } from '../../components';
import { useStore } from '../../services/store';
import { authAPI } from '../../services/api';
import type { AuthScreenProps, AuthNavProp } from '../../types/navigation';

const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logo:   { fontSize: 32, fontWeight: Typography.weights.black, letterSpacing: -1, color: Colors.text },
  tagline:{ fontSize: 13, color: Colors.textSub, marginTop: 6, textAlign: 'center' },
  card:   { backgroundColor: Colors.card, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: Spacing.xl, width: '100%', marginTop: Spacing.xxl },
  row:    { flexDirection: 'row', gap: 8, marginTop: 8 },
  link:   { color: Colors.neon, fontWeight: Typography.weights.bold, fontSize: 12 },
  divLine:{ flex: 1, height: 1, backgroundColor: Colors.border, alignSelf: 'center' },
  divTxt: { fontSize: 11, color: Colors.textSub, marginHorizontal: 10 },
  error:  { fontSize: 11, color: '#ff7a8a', marginTop: 4, marginBottom: 4 },
});

// ── Welcome Screen ─────────────────────
export const WelcomeScreen = ({ navigation }: AuthScreenProps<'Welcome'>) => (
  <View style={[S.screen, S.center]}>
    <View style={{ marginBottom: 40, alignItems: 'center' }}>
      <View style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...Shadows.neonSm }}>
        <Image source={logo} style={{ width: 50, height: 50, borderRadius: 12 }} resizeMode="contain" />
      </View>
      <Text style={S.logo}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
      <Text style={S.tagline}>Sua plataforma fitness completa{'\n'}com IA coach personalizada</Text>
    </View>

    <View style={{ width: '100%', gap: 12 }}>
      <NeonButton label="Sou Instrutor / Professor" onPress={() => navigation.navigate('LoginInstrutor')} />
      <NeonButton label="Sou Aluno" onPress={() => navigation.navigate('LoginAluno')} variant="ghost" />
    </View>

    <Text style={{ color: Colors.textSub, fontSize: 11, marginTop: 32, textAlign: 'center' }}>
      Versão 1.0.0 · Camis FIT © 2025
    </Text>
  </View>
);

// ── Login Instrutor ────────────────────
export const LoginInstrutorScreen = ({ navigation }: AuthScreenProps<'LoginInstrutor'>) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      const res = await authAPI.loginInstrutor(email, senha);
      const { token, user: u } = res.data;
      await SecureStore.setItemAsync('camisfit_token', token);
      setUser({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: 'instrutor',
        cref: u.cref,
        pixChave: u.pix_chave,
        codigoConvite: u.codigo_convite,
        avatarInitials: u.nome.slice(0, 2).toUpperCase(),
      }, token);
    } catch (err: any) {
      if (err.response?.data?.emailPendente) {
        Alert.alert(
          'Verifique seu email',
          'Digite o código que enviamos para ativar sua conta.',
          [{ text: 'Digitar código', onPress: () => navigation.navigate('CadastroInstrutor', { emailPendente: email }) }],
        );
      } else {
        Alert.alert('Erro ao entrar', err.response?.data?.erro || 'Verifique suas credenciais e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Instrutor</Text>

        <View style={[S.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.purple, marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: '#cc88ff' }}>Área do Instrutor</Text>
          </View>

          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />

          <NeonButton label="Entrar como Instrutor" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroInstrutor')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!email) { Alert.alert('Informe seu email', 'Digite seu email para abrir a verificação.'); return; }
              navigation.navigate('CadastroInstrutor', { emailPendente: email });
            }}
            style={{ alignItems: 'center', marginTop: 14 }}
          >
            <Text style={S.link}>Já tenho o código do email</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Cadastro Instrutor ─────────────────
export const CadastroInstrutorScreen = ({ navigation, route }: AuthScreenProps<'CadastroInstrutor'>) => {
  const emailParam = route.params?.emailPendente || '';
  const [etapa, setEtapa] = useState<1 | 2>(emailParam ? 2 : 1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cref, setCref] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [emailPendente, setEmailPendente] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const setUser = useStore(s => s.setUser);

  useEffect(() => {
    if (route.params?.emailPendente) {
      setEmail(route.params.emailPendente);
      setEmailPendente(route.params.emailPendente);
      setEtapa(2);
    }
  }, [route.params?.emailPendente]);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !cref) { Alert.alert('Preencha todos os campos obrigatórios'); return; }
    if (senha !== confirmar) { Alert.alert('As senhas não conferem'); return; }
    setLoading(true);
    try {
      const res = await authAPI.cadastroInstrutor({ nome, email, senha, cref, telefone });
      setEmailPendente(res.data?.email || email);
      setCodigo('');
      setEtapa(2);
    } catch (err: any) {
      const msg = err.response?.data?.erro
        || (err.code === 'ECONNABORTED' ? 'Tempo limite atingido. Verifique sua conexão.' : null)
        || err.message
        || 'Tente novamente.';
      Alert.alert('Erro ao cadastrar', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async () => {
    if (codigo.length !== 6) { Alert.alert('Código inválido', 'Digite exatamente 6 dígitos'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verificarEmailInstrutor(emailPendente, codigo);
      const { token, user: u } = res.data;
      await SecureStore.setItemAsync('camisfit_token', token);
      setUser({
        id: u.id, nome: u.nome, email: u.email, role: 'instrutor',
        cref: u.cref, pixChave: u.pix_chave, codigoConvite: u.codigo_convite,
        avatarInitials: u.nome.slice(0, 2).toUpperCase(),
      }, token);
    } catch (err: any) {
      const errMsg = err.response?.data?.erro || 'Verifique o código e tente novamente.';
      Alert.alert('Código inválido ou expirado', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoadingReenvio(true);
    try {
      await authAPI.reenviarCodigoInstrutor(emailPendente);
      Alert.alert('Código reenviado!', `Verifique sua caixa de entrada em ${emailPendente}`);
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
    } finally {
      setLoadingReenvio(false);
    }
  };

  if (etapa === 2) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
        <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
          <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
          <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Ative sua conta</Text>

          <View style={[S.card]}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>📧</Text>
              <Text style={{ fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.text, textAlign: 'center' }}>Verifique seu email</Text>
              <Text style={{ fontSize: 12, color: Colors.textSub, textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={{ color: Colors.neon, fontWeight: Typography.weights.bold }}>{emailPendente}</Text>
              </Text>
            </View>

            <Input
              label="Código de ativação"
              value={codigo}
              onChangeText={v => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="numeric"
              autoFocus
            />

            <NeonButton label="Ativar conta" onPress={handleVerificar} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={handleReenviar} disabled={loadingReenvio} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSub, fontSize: 12 }}>
                {loadingReenvio ? 'Reenviando...' : 'Não recebeu? '}
                <Text style={S.link}>{loadingReenvio ? '' : 'Reenviar código'}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setEtapa(1)} style={{ marginTop: 20 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>← Voltar ao cadastro</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 28, textAlign: 'center' }}>Cadastro de Instrutor</Text>

        <View style={{ backgroundColor: Colors.purpleDim, borderWidth: 1, borderColor: Colors.purple + '50', borderRadius: Radius.md, padding: 12, marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#cc88ff', fontWeight: Typography.weights.bold }}>Acesso Premium de Instrutor</Text>
          <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 3 }}>Gerencie alunos, treinos, dietas e pagamentos</Text>
        </View>

        <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Prof. Ana Beatriz Santos" />
        <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="ana@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="CREF *" value={cref} onChangeText={setCref} placeholder="123456-G/SP" autoCapitalize="characters" />
        <Input label="Telefone (WhatsApp)" value={telefone} onChangeText={setTelefone} placeholder="(11) 99999-9999" keyboardType="phone-pad" />
        <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />
        <Input label="Confirmar senha *" value={confirmar} onChangeText={setConfirmar} placeholder="Repita a senha" secureTextEntry />

        <NeonButton label="Criar conta de Instrutor" onPress={handleCadastro} loading={loading} style={{ marginTop: 8 }} />
        <TouchableOpacity
          onPress={() => {
            if (!email) { Alert.alert('Informe seu email', 'Digite seu email para abrir a verificação.'); return; }
            setEmailPendente(email);
            setEtapa(2);
          }}
          style={{ alignItems: 'center', marginTop: 14 }}
        >
          <Text style={S.link}>Já recebi o código por email</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginInstrutor')}>
            <Text style={S.link}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Login Aluno ────────────────────────
export const LoginAlunoScreen = ({ navigation }: AuthScreenProps<'LoginAluno'>) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      const res = await authAPI.loginAluno(email, senha);
      const { token, user: u } = res.data;
      await SecureStore.setItemAsync('camisfit_token', token);
      setUser({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: 'aluno',
        instrutorId: u.instrutor_id,
        instrutorNome: u.instrutor_nome,
        nivel: u.nivel_gamif,
        xp: u.xp,
        peso: u.peso,
        altura: u.altura,
        objetivo: u.objetivo,
        avatarInitials: u.avatar_initials,
      }, token);
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.response?.data?.erro || 'Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Aluno</Text>

        <View style={S.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.neon, marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.neon }}>Área do Aluno</Text>
          </View>

          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />

          <NeonButton label="Entrar como Aluno" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroAluno')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>← Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── Cadastro Aluno ─────────────────────
export const CadastroAlunoScreen = ({ navigation }: AuthScreenProps<'CadastroAluno'>) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [loading, setLoading] = useState(false);
  const setUser = useStore(s => s.setUser);

  const objetivos = ['Hipertrofia', 'Emagrecimento', 'Definição', 'Manutenção', 'Saúde geral'];

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !codigo) { Alert.alert('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      const res = await authAPI.cadastroAluno({
        nome, email, senha,
        codigoInstrutor: codigo,
        peso: +peso || 70,
        altura: +altura || 170,
        objetivo,
      });
      const { token, user: u } = res.data;
      await SecureStore.setItemAsync('camisfit_token', token);
      setUser({
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: 'aluno',
        instrutorId: u.instrutor_id,
        instrutorNome: u.instrutor_nome,
        nivel: u.nivel_gamif || 1,
        xp: u.xp || 0,
        peso: u.peso,
        altura: u.altura,
        objetivo,
        avatarInitials: u.avatar_initials,
      }, token);
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err.response?.data?.erro || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 24, textAlign: 'center' }}>Cadastro de Aluno</Text>

        {/* Steps indicator */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[1, 2].map(n => (
            <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= step ? Colors.neon : Colors.border }} />
          ))}
        </View>

        {step === 1 ? (
          <>
            <Text style={{ fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 16 }}>
              Seus dados
            </Text>
            <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Rafael Silva" />
            <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="rafael@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />

            <View style={{ backgroundColor: Colors.neonDim, borderWidth: 1, borderColor: Colors.neonBorder, borderRadius: Radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: Colors.neon, fontWeight: Typography.weights.bold }}>Código do Instrutor *</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 2 }}>Seu instrutor vai te passar este código</Text>
            </View>
            <Input label="" value={codigo} onChangeText={v => setCodigo(v.toUpperCase())} placeholder="Ex: ANA-847" autoCapitalize="characters" />

            <NeonButton label="Próximo →" onPress={() => { if (!nome || !email || !senha || !codigo) { Alert.alert('Preencha todos os campos'); return; } setStep(2); }} style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <Text style={{ fontSize: 15, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 16 }}>
              Seu perfil fitness
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1 }}><Input label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="70" keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Input label="Altura (cm)" value={altura} onChangeText={setAltura} placeholder="170" keyboardType="numeric" /></View>
            </View>

            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Objetivo principal
            </Text>
            {objetivos.map(o => (
              <TouchableOpacity key={o} onPress={() => setObjetivo(o)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: o === objetivo ? Colors.neonBorder : Colors.border, backgroundColor: o === objetivo ? Colors.neonDim : Colors.card, marginBottom: 6 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: o === objetivo ? Colors.neon : Colors.textSub, backgroundColor: o === objetivo ? Colors.neon : 'transparent', marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: o === objetivo ? Colors.neon : Colors.text, fontWeight: o === objetivo ? Typography.weights.bold : Typography.weights.regular }}>{o}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <NeonButton label="← Voltar" onPress={() => setStep(1)} variant="ghost" style={{ flex: 1 }} />
              <NeonButton label="Criar conta" onPress={handleCadastro} loading={loading} style={{ flex: 1 }} />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginAluno')}>
            <Text style={S.link}>Fazer login</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
