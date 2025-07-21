import { Box } from "@mui/material"

export default function ThreeDotLoading() {
    return (
        <>
            <Box>
                <div className="dot-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </Box>

            {/* Custom loader CSS */}
            <style>
                {`
                .dot-loader {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .dot-loader span {
                    width: 12px;
                    height: 12px;
                    background-color: #00e676;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }

                .dot-loader span:nth-child(1) {
                    animation-delay: -0.32s;
                }

                .dot-loader span:nth-child(2) {
                    animation-delay: -0.16s;
                }

                .dot-loader span:nth-child(3) {
                    animation-delay: 0s;
                }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    } 
                    40% {
                        transform: scale(1);
                    }
                }
                `}
            </style>
        </>
    )
}