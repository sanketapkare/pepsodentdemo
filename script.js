AFRAME.registerComponent('ar-handler', {
    init: function () {
        const sceneEl = this.el;
        const model1 = document.getElementById('model1');
        const model2 = document.getElementById('model2');
        const model3 = document.getElementById('model3');
        const model4 = document.getElementById('model4');

        const models = [model1, model2, model3, model4];
        let currentModelIndex = 0;
        let isAnimating = false;
        let displayTimeout;

        function setOpacity(model, opacity) {
            model.object3D.traverse((node) => {
                if (node.isMesh) {
                    node.material.opacity = opacity;
                    node.material.transparent = opacity < 1;
                }
            });
        }

        function fadeOut(model, onComplete) {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.1;
                setOpacity(model, opacity);
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    model.setAttribute('visible', false);
                    if (onComplete) onComplete();
                }
            }, 60);
        }

        function fadeIn(model) {
            let opacity = 0;
            model.setAttribute('visible', true);
            const fadeInterval = setInterval(() => {
                opacity += 0.1;
                setOpacity(model, opacity);
                if (opacity >= 1) {
                    clearInterval(fadeInterval);
                }
            }, 60);
        }

        function hasAnimations(model) {
            let hasAnim = false;
            model.object3D.traverse((node) => {
                if (node.animations && node.animations.length > 0) {
                    hasAnim = true;
                }
            });
            return hasAnim;
        }

        function showModel(model) {
            console.log('Showing model:', model.id);
            fadeIn(model);
            
            if (hasAnimations(model)) {
                console.log('Model has animations, playing...');
                model.setAttribute('animation-mixer', {
                    clip: '*',
                    loop: 'once',
                    clampWhenFinished: true,
                    crossFadeDuration: 0.3
                });
                model.addEventListener('animation-finished', onAnimationFinished, { once: true });
            } else {
                console.log('Model has no animations, displaying for 5 seconds');
                displayTimeout = setTimeout(onModelComplete, 5000);
            }
            
            isAnimating = true;
        }

        function hideModel(model, onComplete) {
            console.log('Hiding model:', model.id);
            if (displayTimeout) {
                clearTimeout(displayTimeout);
                displayTimeout = null;
            }
            fadeOut(model, () => {
                model.removeAttribute('animation-mixer');
                if (onComplete) onComplete();
            });
        }

        function onAnimationFinished(event) {
            console.log('Animation finished for:', event.target.id);
            onModelComplete();
        }

        function onModelComplete() {
            console.log('Model display completed for:', models[currentModelIndex].id);
            isAnimating = false;
            hideModel(models[currentModelIndex], () => {
                currentModelIndex = (currentModelIndex + 1) % models.length;
                showModel(models[currentModelIndex]);
            });
        }

        sceneEl.addEventListener('arReady', () => {
            console.log('AR system is ready');
        });

        sceneEl.addEventListener('arError', (event) => {
            console.error('AR error:', event);
        });

        sceneEl.addEventListener('targetFound', () => {
            console.log('Target image found');
            if (!isAnimating) {
                showModel(models[currentModelIndex]);
            }
        });

        sceneEl.addEventListener('targetLost', () => {
            console.log('Target image lost');
            // Optionally, you might want to hide the current model or pause the animation here
        });

        models.forEach((model, index) => {
            model.addEventListener('model-loaded', () => {
                console.log(`Model ${index + 1} loaded`);
                setOpacity(model, 0);
            });
        });
    }
});