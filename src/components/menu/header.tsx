import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Breakpoint, BreakpointProvider, setDefaultBreakpoints } from 'react-socks';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import useOnclickOutside from 'react-cool-onclickoutside';
import { useBlockchainContext } from '../../context';
import SearchModal from '../components/searchModal';
import { changeNetwork } from '../../utils';
import config from '../../config.json'
import { useWallet } from '../../use-wallet/src';

setDefaultBreakpoints([{ xs: 0 }, { l: 1199 }, { xl: 1200 }]);

const NavLink = (props: any) => (
    <Link
        {...props}
        getProps={({ isCurrent }: {isCurrent: any}) => {
            // the object returned here is passed to the
            // anchor element's props
            return {
                className: isCurrent ? 'active' : 'non-active'
            };
        }}
    />
);



const Header = () => {
    const navigate = useNavigate();
    const wallet = useWallet();
    const { address } = useParams();
    
    const [state, { dispatch, setSearch }] = useBlockchainContext() as any;
    const [openMenu1, setOpenMenu1] = useState(false);
    const [openMenu2, setOpenMenu2] = useState(false);
    const [openMenu3, setOpenMenu3] = useState(false);
    const [searchModal, setSearchModal] = useState(false);
    const [searchKey, setSearchKey] = useState('');
    const [focused, setFocused] = useState(false);
    const [switchFocus, setSwitchFocus] = useState(false);
    const [headerClass, setHeaderClass] = useState("main-header rt-sticky");
    const [mobileMenu, setMobileMenu] = useState({
		main: false,
		sub1: false,
		sub2: false
	});
    const [menu, setMenu] = useState('')
	const [langMenu, setLangMenu] = useState(false)
	const location = useLocation()
    const [status, setStatus] = useState({
        search: ''
    })
    const [walletInited, setWalletInited] = useState(false)

    const account = address || wallet.account

    useEffect(() => {
        if (searchKey.trim() !== '' && focused) {
            setSearchModal(true);
        } else {
            setTimeout(() => {
                setSearchModal(false);
            }, 200);
        }
    }, [searchKey, focused]);

    const collectionFilter = useCallback(
        (item: any) => {
            const searchParams = ['address', 'name', 'description'];
            return searchParams.some((newItem) => {
                try {
                    return (
                        item['metadata'][newItem]
                            ?.toString()
                            .toLowerCase()
                            .indexOf(searchKey.toLowerCase()) > -1
                    );
                } catch (err) {
                    return false;
                }
            });
        },
        [searchKey]
    );

    const nftFilter = useCallback(
        (item: any) => {
            const searchParams = ['owner', 'name', 'description', 'collectionAddress'];
            return searchParams.some((newItem) => {
                try {
                    return (
                        item[newItem]?.toString().toLowerCase().indexOf(searchKey.toLowerCase()) >
                            -1 ||
                        item['metadata'][newItem]
                            ?.toString()
                            .toLowerCase()
                            .indexOf(searchKey.toLowerCase()) > -1
                    );
                } catch (err) {
                    return false;
                }
            });
        },
        [searchKey]
    );

    const collectionDatas = useMemo(() => {
        try {
            return state.collectionNFT.filter(collectionFilter).splice(0, 20);
        } catch (err) {
            return [];
        }
    }, [state.collectionNFT, collectionFilter]);

    const nftDatas = useMemo(() => {
        try {
            return state.allNFT.filter(nftFilter).splice(0, 20);
        } catch (err) {
            return [];
        }
    }, [state.allNFT, nftFilter]);
    const checkNetwork = async () => {
        console.log("checkNetwork")
        try {
            const {ethereum} = wallet
            //if metamask is connected and wallet is not connected ( chain error))
            if (ethereum) {
                const chainId = await ethereum.request({
                    method: 'eth_chainId'
                });
                console.log('chainId', chainId)
                if (Number(chainId)!==config.chainId) {
                    await changeNetwork(ethereum, config.chainId);
                }
            }
            localStorage.setItem('isConnected', "1");
        } catch (err) {
            console.log((err as any).message);
        }
    }
    const handleConnect = () => {
        if (wallet.status == 'connected') {
            wallet.reset();
            dispatch({
                type: 'auth',
                payload: {
                    isAuth: false,
                    name: '',
                    email: '',
                    bio: '',
                    address: '',
                    image: null,
                    bannerImage: null
                }
            });
            localStorage.setItem('isConnected', "0");
        } else {
            wallet.connect()
        }
    };

    const closeMenu1 = () => {
        setOpenMenu1(false);
    };
    const onConnectWallet = async () => {
        console.log("wallet-status", wallet.status)
        try {
            if (wallet.ethereum) {
                const chainId = await wallet.ethereum.request({
                    method: 'eth_chainId'
                });
                if (Number(chainId)!==config.chainId) {
                    console.log('NowchainId', chainId)
                    await changeNetwork(wallet.ethereum, config.chainId);
                    return
                } else if (wallet.status==='disconnected' && localStorage.getItem('isConnected')==="1") {
                    // localStorage.setItem('isConnected', "0")
                    if (!walletInited) {
                        setWalletInited(true)
                        wallet.connect()
                    }
                    // wallet.connect();
                } else if ((wallet.status==='connected' || wallet.status==='error'/*  || wallet.status==='connecting' */) && localStorage.getItem('isConnected')==="0") {
                    localStorage.setItem('isConnected', "1")
                    checkNetwork()
                }
            }
        } catch (error) {
            console.log("connect-wallet", error)
        }
    }

	React.useEffect(()=>{
		if (wallet.error) console.log('wallet error', wallet.error)
	}, [wallet.error])


    useEffect(() => {
        onConnectWallet()
    }, [wallet.status, wallet.account]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        if (location.pathname==='/') {
            setMenu('Buy Crypto Domains')
        } else if (location.pathname.indexOf('listed-domains')===1) {
            setMenu('Listed Crypto Domains')
        } else if (location.pathname.indexOf('how-work')===1) {
            setMenu('How it works')
        } else if (location.pathname.indexOf('partnership')===1) {
            setMenu('Partnership')
        } else if (location.pathname.indexOf('faq')===1) {
            setMenu('Faq')
        } else if (location.pathname.indexOf('cns-token')===1) {
            setMenu('CNS Token')
        } else if (location.pathname.indexOf('auction')===1) {
            setMenu('List Domain For Sale')
        } else if (location.pathname.indexOf('my-domains')===1) {
            setMenu('My Domains')
        } else if (/^0x[0-9A-Fa-f]{40}$/.test(location.pathname.slice(1))) {
            if (account) {
                setMenu(`${account.slice(0, 10)}...${account.slice(-4)}`)
            } else {
                setMenu("no selected address")
            }
        } else if (location.pathname.indexOf('domain')===1) {
            setMenu(location.pathname.slice(location.pathname.lastIndexOf('/')+1))
        }
    }, [location.pathname])

    const onScroll = () => {
        const sticky = 170
        if (window.pageYOffset > sticky) {
			setHeaderClass("main-header rt-sticky rt-sticky-active fadeInDown animated")
        } else {
			setHeaderClass("main-header rt-sticky")
        }
        if (window.pageYOffset > sticky) {
            closeMenu1();
        }
    }

    const onSearch = () => {
        if (status.search.length < 3) return;
        let search = status.search.slice(-4)==='.eth' ? status.search : `${status.search}.eth`
        navigate(`/domain/${search}`);
    }

    return (
        <>
            <header className='rt-site-header rt-fixed-top white-menu'>
				<div className="top-header">
				<div className="container">
					<div className="row align-items-center">
						<div className="col-md-6 md-start sm-center">
							
							<ul className="text-center text-md-left top-social">
								<li><span><a href="#" className="f-size-14 text-white"><img src="/assets/images/all-img/top-1.png" alt="" draggable="false" /> Support</a></span></li>
								<li style={{position: 'relative', cursor: 'pointer'}} onClick={()=>setLangMenu(!langMenu)}>
									<span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="2" style={{width: '100%'}}>
										<span className="selection">
											<span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" aria-disabled="false" aria-labelledby="select2-from-l2-container">
												<span className="select2-selection__rendered" id="select2-from-l2-container" role="textbox" aria-readonly="true" title="EN">EN</span>
												<span className="select2-selection__arrow" role="presentation">
													<b role="presentation"></b>
												</span>
											</span>
										</span>
										<span className="dropdown-wrapper" aria-hidden="true"></span>
									</span>
									<span className="select-arrwo">
										<i className="icofont-thin-down"></i>
									</span>
									<ul className='lang-menu' style={{display: `${langMenu ? 'block' : 'none'}`}}>
										<li>EN</li>
									</ul>
								</li>
								<li><a href=""><i className="icofont-telegram"></i></a></li>
								<li><a href=""><i className="icofont-twitter"></i></a></li>
			
							</ul>
						</div>
						<div className="col-md-6 text-center text-md-right md-end sm-center" style={{gap: '0.5em'}}>
							{/* {wallet.status == 'connected' && (
								<div
									className="switch_network"
									onBlur={() =>
										setTimeout(() => setSwitchFocus(false), 100)
									}>
									<button
										className="rt-btn rt-gradient pill text-uppercase"
                                        style={{lineHeight: '10px', fontSize: '1.5rem', fontWeight: 'bold'}}
										onClick={() => setSwitchFocus(!switchFocus)}>
										Switch Network
									</button>
									{switchFocus && (
										<ul>
											<li>Bitcoin evm</li>
											<li>Spagetti testnet</li>
											<li>Fantom</li>
										</ul>
									)}
								</div>
							)} */}
							<button className="rt-btn rt-gradient pill text-uppercase" style={{lineHeight: '10px', fontSize: '1.5rem', fontWeight: 'bold'}} onClick={handleConnect}>
								{wallet.status==='connecting' ? 'Connecting...' : (
									(wallet.status == 'connected' && wallet.account) ? `${wallet.account.slice(0, 4)}...${wallet.account.slice(-4)}` : 'Connect Wallet'
								)}
							</button>
							{/* <a href="#" className="rt-btn rt-gradient pill text-uppercase" style={{lineHeight: '10px', width: '75%', fontSize: '1.5rem', fontWeight: 'bold'}}>Connect Wallet
							</a> */}
						</div>
					</div>
				</div>
			</div> 
				<div id="myHeader" className={headerClass}>
					<nav className="navbar">
						<div className="container">
							<Link to="/" className="brand-logo"><img src="/assets/images/logo/logo.png" alt="" /></Link>
							<Link to="/" className="sticky-logo"><img src="/assets/images/logo/logo.png" alt="" /></Link>
							<div className="ml-auto d-flex align-items-center">
									<div className="main-menu">
									<ul className={mobileMenu.main ? 'show' : ''}>
										<li className={menu==='Buy Crypto Domains' ? 'current-menu-item' : ''}><Link to="/">Home</Link></li>
										<li className={menu==='Listed Crypto Domains' ? 'current-menu-item' : ''}><Link to="/listed-domains">Buy Domain</Link></li>
									
										{/* <li className="menu-item-has-children" onClick={()=>setMobileMenu({...mobileMenu, sub1: !mobileMenu.sub1})}><Link to="#">Buy Domain</Link>
											<ul className="sub-menu" style={{display: `${mobileMenu.sub1 ? 'block' : ''}`}}>
												<li><Link to="/listed-domains">All Listed Domains</Link></li>
												<li><Link to="/fixed-price">Fixed Price</Link></li>
												<li><Link to="/auctions">Auction List</Link></li>
											</ul>
										</li> */}
                                        {!!wallet.account && <li className={menu==='My Domains' ? 'current-menu-item' : ''}><Link to={`/${!!wallet.account ? wallet.account : ''}`}>Sell Your Domain</Link></li>}
										<li className={`menu-item-has-children ${menu==='How it works' || menu==='Faq' || menu==='Partnership' ? 'current-menu-item' : ''}`} onClick={()=>setMobileMenu({...mobileMenu, sub2: !mobileMenu.sub2})}><Link to="#">Information</Link>
											<ul className="sub-menu" style={{display: `${mobileMenu.sub2 ? 'block' : ''}`}}>
												<li><Link to="/how-work">How It Works</Link></li>
												<li><Link to="/faq">FAQ</Link></li>
												<li><Link to="/partnership">Partnership</Link></li>
											</ul>
										</li>
										<li className={menu==='CNS Token' ? 'current-menu-item' : ''}><Link to="/cns-token">CNS Token</Link></li>
									</ul>
								</div>
							<div className="rt-nav-tolls d-flex align-items-center">
								<div className="mobile-menu" onClick={()=>setMobileMenu({...mobileMenu, main: !mobileMenu.main})}>
									<div className="menu-click">
										<span></span>
										<span></span>
										<span></span>
									</div>
								</div>
							</div>
						</div>
						</div>
					</nav>
				</div>
			</header>
			<div className="rt-breadcump rt-breadcump-height breaducump-style-2">
				<div className="rt-page-bg rtbgprefix-full" style={{backgroundImage: 'url(/assets/images/banner/breadcump-img.png)'}}>
				</div>
				<div className="container">
					<div className="rt-spacer-60"></div>

					<div className="row rt-breadcump-height align-items-center">
						<div className="col-lg-8 col-xl-7 mx-auto text-center text-white">
							<h4 className="f-size-70 f-size-lg-50 f-size-md-40 f-size-xs-24 rt-strong" style={{lineBreak: `${location.pathname.indexOf('domain')===1 ? 'anywhere' : 'auto'}`}}>{menu}</h4>
                            {/* {location.pathname.indexOf('domain')===1 && <h4 className="f-size-36 f-size-lg-30 f-size-md-24 f-size-xs-16 rt-light3">is listed for sale!</h4>} */}
                            {menu==='My Domains' && <p style={{marginTop: '4rem', lineBreak: 'anywhere'}}>{state.auth.address?.slice(0, 8) + '...' + state.auth.address?.slice(-8)}</p>}
							{
								(menu === 'Listed Crypto Domains' || menu === 'Buy Crypto Domains') && (
									<div className="rt-mt-30 domain-searh-form" data-duration="1.8s" data-dealy="0.9s"
										data-animation="wow fadeInUp">
										<input type="text" placeholder="enter a new search" value={status.search} onChange={e=>setStatus({...status, search: e.target.value})} onKeyDown={e=>e.key==='Enter' && onSearch()} />
								
										<button className="rt-btn rt-gradient pill rt-Bshadow-1" onClick={onSearch}>Search <span><i className="icofont-simple-right"></i></span>
										</button>
									</div>
								)
							}
						</div>
					</div>
				</div>
				{/* <div className="container">
					<div className="rt-spacer-60"></div>

					<div className="row rt-breadcump-height align-items-center">
						<div className="col-lg-12 mx-auto text-center text-white">
							<h4 className="f-size-70 f-size-lg-50 f-size-md-40 f-size-xs-24 rt-strong">ELON.ETH</h4>
							<h4 className="f-size-36 f-size-lg-30 f-size-md-24 f-size-xs-16 rt-light3">is listed for sale!</h4>
						</div>
					</div>
				</div> */}
			</div>
        </>
    );
}

export default Header
