import logo from '../../../../../assets/logoWhite.svg'
import Status_Block from './blocks/status_block';
import New_Block from './blocks/new_block';
import Dev_Block from './blocks/developer_block';
import Spotlight_Block from './blocks/spotlight_block';

const H_Blocks = () => {


    return (
        <>
            <div className='block-wrapper'>
                <div className='smlg-blocks'>
                    <div className='block-container '>
                        <div className='block-header'>
                            <h2>Status</h2>
                        </div>
                        <Status_Block />
                    </div>
                    <div className='block-container'>
                        <div className='block-header'>
                            <h2>What's New?</h2>
                        </div>
                        <New_Block />
                    </div>
                </div>
                <div className='duo-blocks'>
                    <div className='block-container'>
                        <div className='block-header'>
                            <h2>Developer</h2>
                        </div>
                        <Dev_Block />
                    </div>
                    <div className='block-container'>
                        <div className='block-header'>
                            <h2>Spotlight</h2>
                        </div>
                        <Spotlight_Block />
                    </div>
                </div>

            </div>
        </>
    )
}

export default H_Blocks;