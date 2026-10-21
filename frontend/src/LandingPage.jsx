import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

import logo from './assets/logo.svg';
import iconeLocal from './assets/mapas-e-bandeiras.png';
import fotoSorriso from './assets/Sorriso.JPG';
import fotoIrys from './assets/irys.JPG';
import fotoHian from './assets/hian.JPG';
import fotoDiagnostico from './assets/diagnostico.JPG';
import fotoEquipamentos from './assets/equipamentos.JPG';
import fotoProtese from './assets/protese.JPG';
import fotoMacbook from './assets/foto com macbook.jpg';
import fotoClinica from './assets/foto  clínica.png';

export default function LandingPage() {

    // ANIMAÇÕES AO ROLAR (Com atraso para o React carregar as fotos primeiro)
    useEffect(() => {
        const observer = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        const timer = setTimeout(() => {
            const elementos = document.querySelectorAll('.reveal');
            elementos.forEach((elemento) => {
                observer.observe(elemento);
            });
        }, 150); // Atraso mágico

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-page-wrapper">

            <header>
                {/* Usando landing-container para fugir do Tailwind! */}
                <nav className="nav landing-container">
                    <div className="logo">
                        <img src={logo} alt="Logo Clínica Letiery" />
                    </div>

                    <ul>
                        <li><a href="#">Início</a></li>
                        <li><a href="#sobre">Sobre</a></li>
                        <li><a href="#servicos">Tratamentos</a></li>
                        <li><a href="#contato">Contato</a></li>
                    </ul>

                    <Link className="btn-nav" to="/agendar">

                        Agenda Virtual ↗
                        
                    </Link>
                </nav>
            </header>

            <section className="hero">
                {/* Usando landing-container */}
                <div className="hero-content landing-container">
                    <div className="texto">
                        <span className="local">
                            <img src={iconeLocal} alt="localização" />
                            CAMPO BELO • MG
                        </span>

                        <h1>
                            Um sorriso <span>cuidado</span> é feito de <span>detalhes.</span>
                        </h1>

                        <p>
                            Na Clínica Letiery unimos técnica, escuta e acolhimento para transformar
                            cada consulta em uma experiência serena.
                        </p>

                        <div className="botoes">
                            <Link className="btn-principal" to="/agendar">
                                Agendar Horário 
                            </Link>
                            <a className="link" href="#servicos">
                                Ver tratamentos
                            </a>
                        </div>
                    </div>

                    <div className="foto">
                        <img src={fotoSorriso} loading="lazy" alt="Sorriso" />
                        <div className="balao">
                            <h3>+10</h3>
                            <p>ANOS CUIDANDO<br />DE SORRISOS</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usando landing-container */}
            <section className="sobre landing-container" id="sobre">
                <div className="sobre-img">
                    <img className="reveal" src={fotoIrys} alt="Dra. Irys" />
                </div>

                <div className="sobre-text reveal">
                    <span>SOBRE A CLÍNICA</span>
                    <h2>Odontologia com <span>técnica</span> e um jeito humano de cuidar.</h2>
                    <p>
                        A Clínica Letiery nasceu com o propósito de oferecer atendimento odontológico de excelência,
                        em um ambiente acolhedor onde você se sente bem desde a chegada.
                    </p>

                    <div className="numeros reveal">
                        <div><strong>100%</strong><p>Foco no paciente</p></div>
                        <div><strong>6+</strong><p>Especialidades</p></div>
                        <div><strong>MG</strong><p>Campo Belo</p></div>
                    </div>
                </div>
            </section>

            <section className="servicos" id="servicos">
                {/* Usando landing-container */}
                <div className="landing-container reveal">
                    <span>Tratamentos</span>
                    <h2>Cuidado completo para seu sorriso</h2>

                    <div className="cards">
                        <div className="card reveal">
                            <i className="fa-solid fa-tooth"></i>
                            <h3>Clínica Geral</h3>
                            <p>Prevenção e cuidados essenciais.</p>
                        </div>
                        <div className="card reveal">
                            <i className="fa-solid fa-face-smile"></i>
                            <h3>Estética Dental</h3>
                            <p>Transformando sorrisos naturais.</p>
                        </div>
                        <div className="card reveal">
                            <i className="fa-solid fa-teeth"></i>
                            <h3>Implantes</h3>
                            <p>Mais segurança e qualidade de vida.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rotina">
                {/* Usando landing-container */}
                <div className="landing-container">
                    <h2>Nossa rotina de cuidado.</h2>
                    <div className="bastidores">
                        <div className="estetica"><img className="hian" src={fotoHian} alt="Estética" /></div>
                        <div className="diagnostico"><img className="diag" src={fotoDiagnostico} alt="Diagnóstico" /></div>
                        <div className="equipamentos"><img src={fotoEquipamentos} alt="Equipamentos" /></div>
                        <div className="protese"><img src={fotoProtese} alt="Prótese" /></div>
                        <div className="macbook"><img src={fotoMacbook} alt="Macbook" /></div>
                    </div>
                </div>
            </section>

            <section className="contato" id="contato">
                <div className="contato-layout">
                    <div className="contato-texto">
                        <h2>Seu sorriso merece cuidado.</h2>
                        <p>Agende sua consulta com a Clínica Letiery.</p>
                    </div>

                    <div className="lado-direito">
                        <div className="cntt">
                            <div className="info-box">
                                <i className="fa-solid fa-location-dot"></i>
                                <p>Endereço</p>
                                <span>Rua Modestino Ferreira Reis, 74<br />Campo Belo - MG</span>
                            </div>
                            <div className="info-box">
                                <i className="fa-brands fa-whatsapp"></i>
                                <p>WhatsApp</p>
                                <span>(35) 99873-8333</span>
                            </div>
                            <div className="info-box">
                                <i className="fa-regular fa-clock"></i>
                                <p>Horário</p>
                                <span>Seg à Sex · 13h — 20h</span>
                            </div>
                            {/* O botão agora está envolvido num info-box, para ocupar perfeitamente o espaço da grelha (Grid) */}
                            <div className="info-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Link className="btn-principal" to="https://api.whatsapp.com/send?phone=5535998738333&text=Ol%C3%A1%2C%20gostaria%20de%20marcar%20um%20hor%C3%A1rio." style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>

                                    {/* Usamos "style" direto para forçar o ícone a aparecer e ter cor! */}
                                    <i className="fa-brands fa-whatsapp" style={{ color: '#103b30', fontSize: '22px', display: 'inline-block' }}></i>

                                    Agendar pelo WhatsApp
                                </Link>
                            </div>
                        </div>
                    </div>

                    <img src={fotoClinica} alt="Foto da Clínica" />

                    <iframe className="mapa" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.8997276271057!2d-45.27748223040798!3d-20.888210798795402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b53e4f3c1fa033%3A0x5fb25cd0af72d1cc!2sCL%C3%8DNICA%20LETIERY!5e0!3m2!1spt-BR!2sbr!4v1784570771574!5m2!1spt-BR!2sbr" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0 }}></iframe>
                </div>
            </section>

            <footer>
                <p>© Clínica Letiery - Todos os direitos reservados.</p>
            </footer>

        </div>
    );
}